const { createSocialImage } = require('@rocket/cli');

module.exports = async function () {
  const socialMediaImage = await createSocialImage({
    title: 'Introducing',
    subTitle: 'check-html-links',
    footer: 'Rocket Blog',
  });
  return {
    socialMediaImage,
  };
};
