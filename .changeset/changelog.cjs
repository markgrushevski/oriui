// The default changesets changelog (@changesets/changelog-git), with each commit hash linked to GitHub.
const COMMIT = 'https://github.com/markgrushevski/oriui/commit/'
const link = (sha) => `[\`${sha.slice(0, 7)}\`](${COMMIT}${sha})`

module.exports = {
    async getReleaseLine(changeset) {
        const [first, ...rest] = changeset.summary.split('\n').map((line) => line.trimEnd())
        const head = `- ${changeset.commit ? `${link(changeset.commit)}: ` : ''}${first}`
        return rest.length ? `${head}\n${rest.map((line) => `  ${line}`).join('\n')}` : head
    },
    async getDependencyReleaseLine(changesets, dependencies) {
        if (dependencies.length === 0) return ''
        const updated = changesets.map((c) => `- Updated dependencies${c.commit ? ` [${link(c.commit)}]` : ''}`)
        return [...updated, ...dependencies.map((d) => `  - ${d.name}@${d.newVersion}`)].join('\n')
    }
}
