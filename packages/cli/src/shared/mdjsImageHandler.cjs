const normalize = require('mdurl/encode');

function image(h, node) {
  const props = {
    src: normalize(node.url),
    alt: node.alt,
    'rocket-image': 'responsive',
  };

  if (node.title !== null && node.title !== undefined) {
    props.title = node.title;
  }

  return h(node, 'img', props);
}

module.exports = image;
