export default {
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'bodyText',
      title: 'Body text',
      type: 'blockContent',
    },
  ],
};
