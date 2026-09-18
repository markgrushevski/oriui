import { defineNitroPlugin } from '#imports'

/**
 * Repairs the machine-readable surface (/llms.txt, /llms-full.txt) on the way out.
 *
 * @nuxt/content builds those files by turning each page's parsed tree BACK into markdown (`toHast`
 * then `stringifyMarkdown`). That round trip escapes characters it did not need to, and the escapes
 * land in the published text as numeric character references:
 *
 *   - `**\`@oriui/css\`**` -> `&#x2A;*\`@oriui/css\`**`  (a strong whose content opens with inline code)
 *   - `[class reference](#classes)` -> `[class reference](#classes&#x29;`  (every inline link)
 *   - `_(Full …)_` -> `&#x2A;(Full …)*`  (an emphasis whose content opens with a paren)
 *   - the `rel="nofollow"` @nuxt/content itself adds to external links leaks back out as an MDC
 *     attribute block with doubled quotes: `{rel="&#x22;nofollow&#x22;"}`
 *
 * It is upstream, not a property of these pages: feeding the same source straight through
 * `@nuxtjs/mdc`'s own parse -> stringify pair reproduces it with no Nuxt Content in the picture, and
 * unwrapping the paragraph changes nothing. So this is the local workaround, not the fix.
 *
 * The repair is textual because both outputs are plain text for machine consumption, and it is
 * deliberately narrow: drop the leaked `{rel="…"}` block, then decode only the four references the
 * serializer emits. No page source contains a literal `&#x…;`, so nothing authored can be caught by it.
 *
 * Ordering: nitro appends the plugins it scans from `server/plugins/` AFTER the ones modules register,
 * and hookable runs callbacks in registration order — so @nuxt/content has already filled `contents`
 * and `sections` by the time these run.
 */

/** The `rel` MDC attribute block @nuxt/content adds to external links and cannot serialize back. */
const LEAKED_LINK_ATTRS = /\{rel="(?:&#x22;)?[^"{}]*(?:&#x22;)?"\}/g

/** `"`, `)`, `*`, `` ` `` — the only references the MDC stringifier emits for this content. */
const OVER_ESCAPED = /&#x(22|29|2A|60);/gi

function repair(markdown: string): string {
    return markdown
        .replace(LEAKED_LINK_ATTRS, '')
        .replace(OVER_ESCAPED, (_match, code: string) => String.fromCharCode(Number.parseInt(code, 16)))
}

export default defineNitroPlugin((nitroApp) => {
    // /llms-full.txt — every page's regenerated markdown.
    nitroApp.hooks.hook('llms:generate:full', (_event, _options, contents: string[]) => {
        contents.forEach((markdown, index) => {
            contents[index] = repair(markdown)
        })
    })

    // /llms.txt — the index. Its titles and descriptions come from page metadata rather than from the
    // serializer, so this is a guard rather than a known repair.
    nitroApp.hooks.hook('llms:generate', (_event, options) => {
        for (const section of options.sections || []) {
            for (const link of section.links || []) {
                if (link.title) link.title = repair(link.title)
                if (link.description) link.description = repair(link.description)
            }
        }
    })
})
