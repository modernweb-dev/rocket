const { createPageSocialImage } = require('@rocket/cli');

module.exports = async function () {
  const socialMediaImage = await createPageSocialImage({
    title: 'Rocket',
    subTitle: 'Static sites with',
    subTitle2: 'a sprinkle of JavaScript.',
  });
  return {
    socialMediaImage,
  };
};
