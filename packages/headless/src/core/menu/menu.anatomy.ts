import { createAnatomy } from '../anatomy';

export const anatomy = createAnatomy('menu', ['trigger', 'content', 'item', 'separator'] as const);
