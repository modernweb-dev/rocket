const { createSocialImage } = require('@rocket/cli');

module.exports = async function () {
  const socialMediaImage = await createSocialImage({
    title: 'Rocket',
    subTitle: 'Static sites with',
    subTitle2: 'a sprinkle of JavaScript.',
    footer: 'A Modern Web Product',
  });
  return {
    socialMediaImage,
  };
};
