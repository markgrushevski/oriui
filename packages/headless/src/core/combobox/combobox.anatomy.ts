import { createAnatomy } from '../anatomy';

export const anatomy = createAnatomy('combobox', [
    'root',
    'label',
    'control',
    'input',
    'trigger',
    'clearTrigger',
    'listbox',
    'option'
] as const);
