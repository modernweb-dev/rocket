import { rocketComponents } from '@rocket/components/components.js';
import { LayoutMain } from '@rocket/spark';
import { sparkComponents } from '@rocket/spark/components.js';
import { layoutData } from '#src/layouts/layoutData.js';

export const layout = new LayoutMain({
  ...layoutData,
});

export const components = {
  ...rocketComponents,
  ...sparkComponents,
};
