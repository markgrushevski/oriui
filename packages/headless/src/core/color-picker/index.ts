// Color-picker core — pure sRGB color math + 2D area math. Imported DIRECTLY by the `./vue`
// `use-color-picker` composable, and deliberately NOT re-exported from the core `.` barrel
// (`../index.ts`), so it stays out of the 1 kB `@oriui/headless` core budget.
export {
    hsvToRgb,
    rgbToHsv,
    rgbToHsl,
    rgbToHex,
    hexToRgb,
    parseColor,
    formatColor,
    relativeLuminance,
    readableInk,
    wrapHue,
    type RGB,
    type HSVA,
    type ColorFormat
} from './color';
export {
    resolveAreaPosition,
    stepAreaPosition,
    type AreaPosition,
    type AreaRect,
    type StepOptions
} from './color-area';
