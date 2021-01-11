[Root](./index.md)
[Guides](./guides.md#with-anchor)
[Raw](./one-level/raw.html)
[Template](../up-one-level/template.njk)
![my-img](./images-one-level/my-img.svg)
![absolute-img](/absolute-img.svg)

<div>
  <a href="./index.md">Root</a>
  <a href="./guides.md#with-anchor">Guides</a>
  <a href="./one-level/raw.html">Raw</a>
  <a href="../up-one-level/template.njk">Template</a>
  <img src="./images-one-level/my-img.svg" alt="my-img">
  <img src="/absolute-img.svg" alt="absolute-img">
  <picture>
    <source media="(min-width:465px)" srcset="./picture-min-465.jpg">
    <img src="../images-up-one-level/picture-fallback.jpg" alt="Fallback" style="width:auto;">
  </picture>
</div>
