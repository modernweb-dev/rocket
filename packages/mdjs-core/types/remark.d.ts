declare module 'remark-rehype' {
  import unified from 'unified';

  export = unified.Plugin;
}

declare module 'rehype-raw' {
  import unified from 'unified';

  export = unified.Plugin;
}

declare module 'rehype-stringify' {
  import unified from 'unified';

  export = unified.Plugin;
}

declare module 'rehype-slug' {
  import unified from 'unified';

  export = unified.Plugin;
}

declare module 'rehype-autolink-headings' {
  import unified from 'unified';

  export = unified.Plugin;
}

declare module 'unist-util-remove' {
  import unified from 'unified';

  function remove(ast: unified.Node, opts: any, test?: any): unified.Node;

  export = remove;
}
