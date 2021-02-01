# Presets >> Joining Blocks ||10

The template system allows for a very granular control of how individual parts will be merged, overwritten or reorderd.

As a preset you may want to add this to your layout.

{% raw %}

```
<footer id="main-footer">
  {% for blockName, blockPath in templateBlocks._joiningBlocks.footer %}
    {% include blockPath %}
  {% endfor %}
</footer>
```

{% endraw %}

This will now render all templates within `_includes/_joiningBlocks/footer/*`.

## Adding content without overriding

Let's assume we have a preset with the following files

```html
<!-- usedPreset/_includes/_joiningBlocks/footer/10-first.njk -->
<p>first</p>

<!-- usedPreset/_includes/_joiningBlocks/footer/20-second.njk -->
<p>second</p>
```

And it produces this in your website

```html
<footer>
  <p>first</p>
  <p>second</p>
</footer>
```

Now we can add a file which will insert content without needing to overwrite any of the preset file.

```html
<!-- docs/_includes/_joiningBlocks/footer/15-in-between.njk -->
<p>in-between</p>
```

the final output will be

```html
<footer>
  <p>first</p>
  <p>in-between</p>
  <p>second</p>
</footer>
```

## Overriding Content

Now if you want to overwrite you can use the same filename.

```html
<!-- docs/_includes/_joiningBlocks/footer/10-first.njk -->
<p>updated first</p>
```

the final output will be

```html
<footer>
  <p>updated first</p>
  <p>second</p>
</footer>
```

## Reordering and Overriding

Sometimes you wanna reorder when you overwrite as well

```html
<!-- docs/_includes/_joiningBlocks/footer/30-first.njk -->
<p>first</p>
```

the final output will be

```html
<footer>
  <p>second</p>
  <p>first</p>
</footer>
```

Note: Reordering always requires you to overwrite as well.
