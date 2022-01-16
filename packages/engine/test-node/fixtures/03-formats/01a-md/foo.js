===>>> INPUT

```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.md';
/* END - Rocket auto generated - do not touch */
```

index.rocket.md sourceRelativeFilePath: "${sourceRelativeFilePath}"

```js server
let foo = 'bar';
```

${foo}

```js server
foo = 'bar2';
```

${foo}


===>>> JS


let rocketAutoConvertedMdText = '';

/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.md';
/* END - Rocket auto generated - do not touch */

rocketAutoConvertedMdText += "";
rocketAutoConvertedMdText += '```js server';
rocketAutoConvertedMdText += "/* START - Rocket auto generated - do not touch */";
rocketAutoConvertedMdText += "export const sourceRelativeFilePath = 'index.rocket.md';";
rocketAutoConvertedMdText += "/* END - Rocket auto generated - do not touch */";
rocketAutoConvertedMdText += "```";
rocketAutoConvertedMdText += "";
rocketAutoConvertedMdText += "index.rocket.md sourceRelativeFilePath: \"${sourceRelativeFilePath}\"";
rocketAutoConvertedMdText += "";
rocketAutoConvertedMdText += "```js server";
let foo = 'bar';
rocketAutoConvertedMdText += "let foo = 'bar';";
rocketAutoConvertedMdText += "```";
rocketAutoConvertedMdText += "";
rocketAutoConvertedMdText += "${foo}";
rocketAutoConvertedMdText += "";
rocketAutoConvertedMdText += "```js server";
rocketAutoConvertedMdText += "foo = 'bar2';";
foo = 'bar2';
rocketAutoConvertedMdText += "```";
rocketAutoConvertedMdText += "";
rocketAutoConvertedMdText += "${foo}";

==> markdown output

<server-code>
import { html } from 'lit-html';
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.md';
/* END - Rocket auto generated - do not touch */
</server-code>

<p>index.rocket.md sourceRelativeFilePath: "${sourceRelativeFilePath}"</p>

<server-code>
let foo = 'bar';
</server-code>

${foo}

<server-code>
foo = 'bar2';
</server-code>

${foo}

===> JS HTML

import { html } from 'lit-html';
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.md';
/* END - Rocket auto generated - do not touch */

const rocketAutoConvertedMdText1 = html`<p>index.rocket.md sourceRelativeFilePath: "${sourceRelativeFilePath}"</p>`;
const rocketAutoConvertedMdText2 = html``;
let foo = 'bar';
const rocketAutoConvertedMdText3 = html``;
const rocketAutoConvertedMdText4 = html`${foo}`;
const rocketAutoConvertedMdText5 = html``;
foo = 'bar2';
const rocketAutoConvertedMdText6 = html``;
const rocketAutoConvertedMdText7 = html`${foo}`;
const rocketAutoConvertedMdText8 = html``;
export default () => html`${rocketAutoConvertedMdText0},${rocketAutoConvertedMdText1},${rocketAutoConvertedMdText2},${rocketAutoConvertedMdText3},${rocketAutoConvertedMdText4},${rocketAutoConvertedMdText5},${rocketAutoConvertedMdText6},${rocketAutoConvertedMdText7},${rocketAutoConvertedMdText8}`;
