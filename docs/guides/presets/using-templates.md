# Presets >> Using templates ||30

The template system allows for very granular control of how individual parts will be merged, overwritten, or reordered.

On top of the [Overriding](./overriding.md) you can do with the presets alone templates have another superpower and that is automatically joining of parts.

It is generally preferred to use `Joining Blocks` before overriding.

## Adding html to the html head

Often you will want to load some more fonts or an additional CSS file. You can do so by adding a file to the head Joining Block.

👉 `docs/_includes/_joiningBlocks/head/additional-styles.njk`

```html
<link rel="stylesheet" href="{{ '/_assets/additional-styles.css' | asset | url }}" />
```

This will add the html at the bottom of the head.

## Adding JavaScript to the bottom of the body

For executing a script you can use the `bottom` Joining Block.

👉 `docs/_includes/_joiningBlocks/bottom/my-script.njk`

```html
<script>
  console.log('hello world');
</script>
```

If you look into `docs/_merged_includes/_joiningBlocks/bottom/` you will see a few scripts

- `10-init-navigation.njk`
- `180-service-worker-update.njk`
- `190-google-analytics.njk`
- `my-script.njk`

## Controlling the order

In the html `<head>` order is usually not that important but when adding script it does.

If you look into the dom then you see that its order matches with the file system order.

Now if you want to move your script in-between `init-nagivation` and `service-worker-update` then you can rename your file to

👉 `docs/_includes/_joiningBlocks/bottom/20-my-script.njk`

which brings the order to

- `10-init-navigation.njk`
- `20-my-script.njk`
- `180-service-worker-update.njk`
- `190-google-analytics.njk`

## More information

For more details please see the [Joining Blocks Docs](../../docs/presets/joining-blocks.md)
