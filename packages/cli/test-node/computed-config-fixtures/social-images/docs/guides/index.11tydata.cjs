const { createSocialImage } = require('@rocket/cli');

module.exports = async function () {
  const socialMediaImage = await createSocialImage({
    title: 'Rocket Guides',
    subTitle: 'Lerning how to',
    subTitle2: 'build a rocket site.',
  });
  return {
    socialMediaImage,
  };
};
