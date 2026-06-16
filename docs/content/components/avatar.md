---
title: Avatar
---

# Avatar

Shows an image, or initials derived from `text` when there is no image (or while it loads).

## Image & initials

::example
:ori-avatar{src="/image-example.jpg" text="Marcus Tullius Cicero"}
:ori-avatar{text="Marcus Tullius Cicero"}
:ori-avatar{text="Ada Lovelace"}

#vue

```vue
<OriAvatar src="/portrait.jpg" text="Marcus Tullius Cicero" />
<OriAvatar text="Marcus Tullius Cicero" />
```

#svelte

```svelte
<div class="ori-avatar ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_rounded">
    <img class="ori-avatar__image" src="/portrait.jpg" alt="Marcus Tullius Cicero" />
</div>
<div class="ori-avatar ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_rounded">
    <div class="ori-avatar__backdrop" aria-hidden="true">MT</div>
</div>
```

::

## With title & subtitle

::example
:ori-avatar{src="/image-example.jpg" text="Marcus Tullius Cicero" title="Marcus Tullius Cicero" subtitle="statesman · lawyer · writer · orator"}

#vue

```vue
<OriAvatar
    src="/portrait.jpg"
    text="Marcus Tullius Cicero"
    title="Marcus Tullius Cicero"
    subtitle="statesman · lawyer · writer · orator"
/>
```

#svelte

```svelte
<div class="ori-avatar ori-avatar_titled ori-size-action ori-size-action_lg">
    <img class="ori-avatar__image" src="/portrait.jpg" alt="Marcus Tullius Cicero" />
    <div class="ori-avatar__text">
        <div class="ori-avatar__title">Marcus Tullius Cicero</div>
        <div class="ori-avatar__subtitle">statesman · lawyer · writer · orator</div>
    </div>
</div>
```

::

## Accessibility

- The image's `alt` comes from `text`; the initials fallback is `aria-hidden`.
