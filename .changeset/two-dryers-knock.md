---
'check-html-links': patch
---

Ignore plain and html encoded mailto links

```html
<!-- source -->
<a href="mailto:address@example.com">contact</a>

<!-- html encoded -->
<a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#97;&#100;&#100;&#114;&#101;&#115;&#115;&#64;&#101;&#120;&#97;&#109;&#112;&#108;&#101;&#46;&#99;&#111;&#109;">contact</a>
```
