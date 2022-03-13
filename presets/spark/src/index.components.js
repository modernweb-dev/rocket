export const sparkComponents = {
  'block-blue': () => import('./BlockBlue.js').then(m => m.BlockBlue),
  'block-features': () => import('./BlockFeatures.js').then(m => m.BlockFeatures),
};
