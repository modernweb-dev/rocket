export const components = {
  'my-el': () => import(new URL('../src/MyEl.js', import.meta.url)).then(m => m.MyEl),
};
