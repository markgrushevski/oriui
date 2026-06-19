/**
 * Anatomy — names the "parts" of a component and produces the `data-scope` / `data-part`
 * attributes (and matching CSS selectors) that hang styling + querying off each part.
 *
 * Design follows Zag.js's `@zag-js/anatomy` (MIT); implementation is our own.
 */

export interface AnatomyPart {
    attrs: { 'data-scope': string; 'data-part': string };
    selector: string;
}

export interface Anatomy<Part extends string> {
    name: string;
    parts: readonly Part[];
    build(): Record<Part, AnatomyPart>;
}

export function createAnatomy<const Parts extends readonly string[]>(
    name: string,
    parts: Parts
): Anatomy<Parts[number]> {
    return {
        name,
        parts,
        build() {
            const result = {} as Record<Parts[number], AnatomyPart>;
            for (const part of parts) {
                result[part as Parts[number]] = {
                    attrs: { 'data-scope': name, 'data-part': part },
                    selector: `[data-scope="${name}"][data-part="${part}"]`
                };
            }
            return result;
        }
    };
}
