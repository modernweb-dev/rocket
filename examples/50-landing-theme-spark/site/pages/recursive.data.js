import { PageTree } from '@rocket/engine';
import { rocketComponents } from '@rocket/components/components';
import { LayoutHome } from '@rocket/spark';
import { sparkComponents } from '@rocket/spark/components';

export const pageTree = new PageTree();
await pageTree.restore(new URL('./pageTreeData.rocketGenerated.json', import.meta.url));

export const layout = new LayoutHome({
  pageTree,
  titleWrapperFn: title => title,
  description: 'Welcome to the Rocket Spark Landing Page example',
  siteName: 'Rocket',
});

export const components = {
  ...rocketComponents,
  ...sparkComponents,
  'block-columns-gray': '#components/BlockColumnsGray::BlockColumnsGray',
};
