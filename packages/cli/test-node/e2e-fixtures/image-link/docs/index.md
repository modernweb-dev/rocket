[Root](./)
[Guides](./guides.md#with-anchor)
[Raw](./one-level/raw.html)
[Template](./template.njk)
![my-img](./images/my-img.svg)
![absolute-img](/images/my-img.svg)

<div>
  <a href="./">Root</a>
  <a href="./guides.md#with-anchor">Guides</a>
  <a href="./one-level/raw.html">Raw</a>
  <a href="./template.njk">Template</a>
  <img src="./images/my-img.svg" alt="my-img">
  <img src="/images/my-img.svg" alt="absolute-img">
  <picture>
    <source media="(min-width:465px)" srcset="./images/picture-min-465.jpg">
    <img src="./images/picture-fallback.jpg" alt="Fallback" style="width:auto;">
  </picture>
</div>
