const { createSocialImage } = require('@rocket/cli');

module.exports = async function () {
  const socialMediaImage = await createSocialImage({
    title: 'Rocket Guides',
    subTitle: 'Learning how to',
    subTitle2: 'build a Rocket site.',
  });
  return {
    socialMediaImage,
  };
};
