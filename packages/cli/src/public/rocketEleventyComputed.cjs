const fs = require('fs');
const { processContentWithTitle } = require('@rocket/core/title');
const { createPageSocialImage } = require('./createPageSocialImage.cjs');

module.exports = {
  titleMeta: async data => {
    if (data.titleMeta) {
      return data.titleMeta;
    }
    let text = await fs.promises.readFile(data.page.inputPath);
    text = text.toString();
    const titleMetaFromContent = processContentWithTitle(text, 'md');
    if (titleMetaFromContent) {
      return titleMetaFromContent;
    }
    return {};
  },
  title: async data => {
    if (data.title) {
      return data.title;
    }
    return data.titleMeta?.title;
  },
  eleventyNavigation: async data => {
    if (data.eleventyNavigation) {
      return data.eleventyNavigation;
    }
    return data.titleMeta?.eleventyNavigation;
  },
  section: async data => {
    if (data.section) {
      return data.section;
    }

    if (data.page.filePathStem) {
      // filePathStem: '/sub/subsub/index'
      // filePathStem: '/index',
      const parts = data.page.filePathStem.split('/');
      if (parts.length > 2) {
        return parts[1];
      }
    }
  },
  socialMediaImage: async data => {
    if (data.socialMediaImage) {
      return data.socialMediaImage;
    }
    if (!data.title) {
      return;
    }

    const section = data.section ? ' ' + data.section[0].toUpperCase() + data.section.slice(1) : '';
    const footer = `${data.site.name}${section}`;

    const imgUrl = await createPageSocialImage({
      title: data.titleMeta.parts ? data.titleMeta.parts[0] : '',
      subTitle:
        data.titleMeta.parts && data.titleMeta.parts[1] ? `in ${data.titleMeta.parts[1]}` : '',
      footer,
    });
    return imgUrl;
  },
};
