export interface NavigationNode {
  title: string;
  excerpt?: string;
  key: string;
  url: string;
  pluginType?: string;
  templateContent: {
    html: string;
  };
  data?: {
    title: string;
    page: {
      url: string;
    };
    eleventyNavigation: {
      key: string;
      title: string;
      order: number;
      url: string;
      parent: string;
    };
  };
  children?: Array<NavigationNode>;
  anchor?: boolean;
}

export interface Heading {
  id?: string;
  text: string;
}

export interface SaxData {
  id: string;
  name: string;
  value: string;
}
