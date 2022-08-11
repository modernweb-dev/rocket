import S from '@sanity/desk-tool/structure-builder';

export default () =>
  S.list()
    .title('Content')
    .items([
      // Home Page
      S.listItem()
        .title('Home Page')
        .child(
          S.editor()
            .id('homePage')
            .schemaType('homePage')
            .documentId('homePage')
            .title('Home Page'),
        ),
      // About Page
      S.listItem()
        .title('About Page')
        .child(
          S.editor()
            .id('aboutPage')
            .schemaType('aboutPage')
            .documentId('aboutPage')
            .title('About Page'),
        ),
      // `S.documentTypeListItems()` returns an array of all the document types
      // defined in schema.js. We filter out those that we have
      // defined the structure above.
      ...S.documentTypeListItems().filter(
        listItem => !['homePage', 'aboutPage'].includes(listItem.getId()),
      ),
    ]);
