const rocketAutoConvertedMdText = [];
let foo = 'bar';
export const sourceRelativeFilePath = 'index.rocket.md';
rocketAutoConvertedMdText.push('```js server');
rocketAutoConvertedMdText.push("let foo = 'bar';");
rocketAutoConvertedMdText.push("export const sourceRelativeFilePath = 'index.rocket.md';");
rocketAutoConvertedMdText.push('```');
rocketAutoConvertedMdText.push('');
rocketAutoConvertedMdText.push(
  'index.rocket.md sourceRelativeFilePath: "${sourceRelativeFilePath}"',
);
rocketAutoConvertedMdText.push('');
rocketAutoConvertedMdText.push('${foo}');
rocketAutoConvertedMdText.push('');
foo = 'baz';
rocketAutoConvertedMdText.push('```js server');
rocketAutoConvertedMdText.push("foo = 'baz';");
rocketAutoConvertedMdText.push('```');
rocketAutoConvertedMdText.push('');
rocketAutoConvertedMdText.push('${foo}');
export default rocketAutoConvertedMdText.join('\n');
