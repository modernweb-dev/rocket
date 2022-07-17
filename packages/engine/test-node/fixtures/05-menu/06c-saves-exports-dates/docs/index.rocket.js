/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
/* END - Rocket auto generated - do not touch */

import { PageTree } from '@rocket/engine';

export const authors = [
  {
    birthDate: new Date('2000-01-01'),
  },
];
export const extras = {
  flagDate: new Date('2001-01-01'),
};
export const dates = [new Date('2002-01-01'), new Date('2003-01-01')];
export const publishDate = new Date('2004-01-01');

const pageTree = new PageTree();
await pageTree.restore(new URL('./pageTreeData.rocketGenerated.json', import.meta.url));
const page = pageTree.getPage(sourceRelativeFilePath);

const formattedDate = new Intl.DateTimeFormat('en-US').format(page.model.publishDate);

export default () => `
  <h1>Welcome</h1>
  <p>${formattedDate}</p>
`;
