export interface EleventyPage {
  title: string;
  eleventyNavigation?: {
    title?: string;
    key: string;
    parent?: string;
    order?: number;
  };
}
