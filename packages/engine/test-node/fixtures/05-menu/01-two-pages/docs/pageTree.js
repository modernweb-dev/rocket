import { TreeModel } from '@d4kmor/tree-model';

const data = {
  h1: 'Home',
  menuLinkText: 'Home',
  url: '/',
  outputRelativeFilePath: 'index.html',
  sourceRelativeFilePath: 'index.rocket.js',
  level: 0,
  children: [
    {
      h1: 'About',
      menuLinkText: 'About',
      url: '/about/',
      outputRelativeFilePath: 'about/index.html',
      sourceRelativeFilePath: 'about.rocket.js',
      level: 1,
    },
    {
      h1: 'Components',
      menuLinkText: 'Components',
      url: '/components/',
      outputRelativeFilePath: 'components/index.html',
      sourceRelativeFilePath: 'components.rocket.js',
      level: 1,
    },
  ],
};

const treeModel = new TreeModel();
export const pageTree = treeModel.parse(data);
