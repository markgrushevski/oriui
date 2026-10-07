// The public API report: what the three published packages promise, written down so a change to it shows up
// in a diff and has to be decided on instead of slipping through.
//
// `api/*.txt` records, from the BUILT packages and the component sources:
//   - every export of each entry point, with its kind and its type as the TypeScript checker prints it (not
//     the emitted .d.ts, whose shape changes with the bundler while the API stays the same);
//   - every component's props, events and slots (vue-component-meta);
//   - every `.ori-*` class, `data-*` attribute selector and `--ori-*` custom property the stylesheet defines, and
//     the stylesheet files a consumer can import.
//
// `npm run api:check` (part of the gate) regenerates the report and fails on any difference.
// `npm run api:update` rewrites it. Removing or narrowing anything in it is a breaking change.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'api')
const require = createRequire(join(ROOT, 'package.json'))
const ts = require('typescript')
const { createChecker } = require('vue-component-meta')

const update = process.argv.includes('--update')

/** Repo-absolute paths in printed types become repo-relative, with forward slashes, on every OS. */
const portable = (text) => text.replaceAll(ROOT.replaceAll('\\', '/'), '').replaceAll(ROOT, '').replaceAll('\\', '/')

// ---------------------------------------------------------------------------------------------------------
// JavaScript entry points
// ---------------------------------------------------------------------------------------------------------

const sorted = (symbols) => [...symbols].sort((a, b) => a.name.localeCompare(b.name))
const NODE_FLAGS = ts.NodeBuilderFlags.NoTruncation | ts.NodeBuilderFlags.InTypeAlias | ts.NodeBuilderFlags.IgnoreErrors
const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed })

function describeExports(entry, { skipValueType } = {}) {
    const program = ts.createProgram([entry], {
        noEmit: true,
        skipLibCheck: true,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        target: ts.ScriptTarget.ESNext
    })
    const checker = program.getTypeChecker()
    const source = program.getSourceFile(entry)
    if (!source) throw new Error(`api-report: cannot read ${entry} — build the packages first`)
    const lines = []

    // TypeScript orders a union by its internal type ids, which follow declaration order, and the bundled
    // .d.ts does not keep that order from one build to the next. Types are printed from their syntax tree with
    // every union sorted, at any depth, so the report changes only when the API does.
    const print = (node) => printer.printNode(ts.EmitHint.Unspecified, node, source).replace(/\s+/g, ' ')
    const sortUnions = (node) =>
        ts.visitNode(node, function visit(child) {
            const next = ts.visitEachChild(child, visit, ts.nullTransformationContext)
            if (!ts.isUnionTypeNode(next)) return next
            const members = [...next.types].sort((x, y) => print(x).localeCompare(print(y)))
            return ts.factory.updateUnionTypeNode(next, ts.factory.createNodeArray(members))
        })
    const typeText = (type) => print(sortUnions(checker.typeToTypeNode(type, undefined, NODE_FLAGS)))
    const signatureText = (signature) =>
        print(
            sortUnions(
                checker.signatureToSignatureDeclaration(signature, ts.SyntaxKind.FunctionType, undefined, NODE_FLAGS)
            )
        )

    // One exported symbol; a namespace (`combobox`, `menu`, …) lists its own exports, indented, instead of
    // the bundler's internal name for it.
    function describe(exported, indent) {
        const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
        const name = exported.name
        const push = (line) => lines.push(indent + line)

        if (symbol.flags & ts.SymbolFlags.Module) {
            push(`namespace ${name} {`)
            for (const member of sorted(checker.getExportsOfModule(symbol))) describe(member, `${indent}    `)
            push('}')
            return
        }
        if (symbol.flags & ts.SymbolFlags.Interface) {
            const type = checker.getDeclaredTypeOfSymbol(symbol)
            push(`interface ${name} {`)
            for (const property of sorted(checker.getPropertiesOfType(type))) {
                const optional = property.flags & ts.SymbolFlags.Optional ? '?' : ''
                const propertyType = checker.getTypeOfSymbol(property)
                push(`    ${property.name}${optional}: ${typeText(propertyType)}`)
            }
            push('}')
            return
        }
        if (symbol.flags & ts.SymbolFlags.TypeAlias) {
            const type = checker.getDeclaredTypeOfSymbol(symbol)
            push(`type ${name} = ${typeText(type)}`)
            return
        }
        if (symbol.flags & ts.SymbolFlags.Value) {
            if (skipValueType?.(name)) {
                push(`component ${name}`)
                return
            }
            const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0]
            const type = checker.getTypeOfSymbolAtLocation(symbol, declaration ?? source)
            const signatures = type.getCallSignatures()
            if (symbol.flags & ts.SymbolFlags.Function && signatures.length) {
                for (const signature of signatures) {
                    push(`function ${name}${signatureText(signature)}`)
                }
            } else {
                push(`const ${name}: ${typeText(type)}`)
            }
            return
        }
        push(`export ${name}`)
    }

    for (const exported of sorted(checker.getExportsOfModule(checker.getSymbolAtLocation(source))))
        describe(exported, '')
    return lines.map(portable)
}

// ---------------------------------------------------------------------------------------------------------
// Vue components
// ---------------------------------------------------------------------------------------------------------

function describeComponents() {
    const componentsDir = join(ROOT, 'packages/vue/src/components')
    const files = readdirSync(componentsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((dir) =>
            readdirSync(join(componentsDir, dir.name))
                .filter((file) => /^ori-.*\.vue$/.test(file))
                .map((file) => join(componentsDir, dir.name, file))
        )
        .sort()
    const checker = createChecker(join(ROOT, 'packages/vue/tsconfig.json'), {
        forceUseTs: true,
        printer: { newLine: 1 }
    })
    const pascal = (file) =>
        file
            .replace(/\.vue$/, '')
            .split('-')
            .map((part) => part[0].toUpperCase() + part.slice(1))
            .join('')

    const lines = []
    for (const file of files) {
        const meta = checker.getComponentMeta(file)
        lines.push(`${pascal(file.split(/[\\/]/).pop())}  (${relative(ROOT, file).replaceAll('\\', '/')})`)
        for (const prop of meta.props.filter((p) => !p.global).sort((a, b) => a.name.localeCompare(b.name))) {
            const fallback = prop.default !== undefined ? ` = ${prop.default}` : ''
            lines.push(`    prop ${prop.name}${prop.required ? '' : '?'}: ${prop.type}${fallback}`)
        }
        for (const event of [...meta.events].sort((a, b) => a.name.localeCompare(b.name))) {
            lines.push(`    event ${event.name}: ${event.type}`)
        }
        for (const slot of [...meta.slots].sort((a, b) => a.name.localeCompare(b.name))) {
            lines.push(`    slot ${slot.name}: ${slot.type}`)
        }
        for (const exposed of [...meta.exposed]
            .filter((e) => !e.name.startsWith('$') && !(e.name in Object.fromEntries(meta.props.map((p) => [p.name]))))
            .sort((a, b) => a.name.localeCompare(b.name))) {
            lines.push(`    exposed ${exposed.name}: ${exposed.type}`)
        }
    }
    return lines.map((line) => portable(line.replace(/\s+/g, ' ').replace(/^ (?=(prop|event|slot|exposed) )/, '    ')))
}

// ---------------------------------------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------------------------------------

function describeCss() {
    const dist = join(ROOT, 'packages/css/dist')
    const styles = join(dist, 'styles.css')
    if (!existsSync(styles)) throw new Error('api-report: packages/css/dist/styles.css is missing — build first')
    // Comments out first, so a class named in prose is not counted.
    const css = readFileSync(styles, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    const unique = (regex) => [...new Set([...css.matchAll(regex)].map((m) => m[1]))].sort()
    const files = [
        ...readdirSync(dist).filter((f) => f.endsWith('.css')),
        ...readdirSync(join(dist, 'components'))
            .filter((f) => f.endsWith('.css'))
            .map((f) => `components/${f}`)
    ].sort()

    return [
        '## files (each importable as @oriui/css/<file>)',
        ...files,
        '',
        '## classes',
        ...unique(/\.(ori-[a-zA-Z0-9_-]+)/g),
        '',
        '## data attributes',
        ...unique(/\[(data-[a-z-]+)/g),
        '',
        '## custom properties',
        ...unique(/(--ori-[a-zA-Z0-9_-]+)\s*:/g)
    ]
}

// ---------------------------------------------------------------------------------------------------------

const header = (title) => [
    `# ${title}`,
    '# Generated by scripts/api-report.mjs — run `npm run api:update` after a deliberate API change.',
    ''
]
const reports = {
    'css.txt': [...header('@oriui/css'), ...describeCss()],
    'headless.txt': [
        ...header('@oriui/headless'),
        '## @oriui/headless',
        ...describeExports(join(ROOT, 'packages/headless/dist/core/index.d.ts')),
        '',
        '## @oriui/headless/vue',
        ...describeExports(join(ROOT, 'packages/headless/dist/vue/index.d.ts'))
    ],
    'vue.txt': [
        ...header('@oriui/vue'),
        '## exports',
        ...describeExports(join(ROOT, 'packages/vue/dist/index.d.ts'), {
            skipValueType: (name) => /^Ori[A-Z]/.test(name)
        }),
        '',
        '## components',
        ...describeComponents()
    ]
}

let changed = 0
for (const [file, lines] of Object.entries(reports)) {
    const text = `${lines.join('\n')}\n`
    const path = join(OUT, file)
    const current = existsSync(path) ? readFileSync(path, 'utf8').replaceAll('\r\n', '\n') : ''
    if (current === text) continue
    changed++
    if (update) {
        mkdirSync(OUT, { recursive: true })
        writeFileSync(path, text)
        console.log(`api-report: wrote api/${file}`)
        continue
    }
    const before = new Set(current.split('\n'))
    const after = new Set(text.split('\n'))
    console.error(`\napi-report: api/${file} no longer matches the packages.`)
    for (const line of current.split('\n')) if (!after.has(line)) console.error(`  - ${line}`)
    for (const line of text.split('\n')) if (!before.has(line)) console.error(`  + ${line}`)
}

if (changed && !update) {
    console.error(
        '\nThe public API changed. If that is intended, run `npm run api:update` and commit api/. A removed or' +
            '\nnarrowed line is a breaking change: say so in the changeset.'
    )
    process.exit(1)
}
if (!changed) console.log('api-report: the public API matches api/')
