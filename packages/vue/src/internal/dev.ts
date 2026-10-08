// The package carries no Node types; the consumer's bundler supplies `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string } } | undefined

/**
 * True in a development build of the app that uses the library. `import.meta.env.DEV` cannot be used:
 * our own library build replaces it with `false`, which compiled every warning out of the published
 * package. The app's bundler inlines `process.env.NODE_ENV` and drops the warnings from its production
 * build; the `typeof` check keeps plain browser ESM, which has no `process`, from throwing.
 */
export const DEV = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'
