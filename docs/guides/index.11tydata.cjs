const { createPageSocialImage } = require('@rocket/cli');

module.exports = async function () {
  const socialMediaImage = await createPageSocialImage({
    title: 'Learning Rocket',
    subTitle: 'Have a website',
    subTitle2: 'in 5 Minutes',
    footer: 'Rocket Guides',
  });
  return {
    socialMediaImage,
  };
};
