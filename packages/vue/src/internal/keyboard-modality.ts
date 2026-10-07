import { ref } from 'vue'

// WebKit does not match :focus-visible on a radio focused by an arrow key, so a native radio group lost its
// focus ring after the first arrow. The group carries `data-ori-keyboard` while the keyboard is in use and the
// stylesheet draws the ring from :focus under it; a pointer press clears it, so a click draws no ring.
export function useKeyboardModality() {
    const keyboard = ref(false)
    return {
        keyboard,
        onKeydown: (): void => {
            keyboard.value = true
        },
        onPointerdown: (): void => {
            keyboard.value = false
        }
    }
}
