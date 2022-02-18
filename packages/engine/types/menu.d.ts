import { Node, TreeModel } from '@d4kmor/tree-model';
import { TemplateResult, nothing } from 'lit';

export type Page = {
  level: number;
  name: string;
  url: string;
  current?: boolean;
  sourceRelativeFilePath?: string;
  // children: Node<Page>;
  menuOrder?: number;
  menuLinkText?: string;
  releaseDateTime?: string;
  subHeading?: string;
  menuNoLink?: boolean;
  title?: string;
  h1?: string;
  active?: boolean;
  headlinesWithId: Array<{
    text: string;
    id: string;
    level: number;
  }>;
};

export type NodeOfPage = Node<Page>;
export type TreeModelOfPage = TreeModel<Page>;

export interface MenuOptions {
  label: string;
  type: string;
}

export interface IndexMenuOptions extends MenuOptions {
  navWrapper: (nav: TemplateResult | typeof nothing) => TemplateResult;
}

export interface ChildListMenuOptions extends MenuOptions {
  maxDepth: number;
}

export interface TableOfContentsMenuOptions extends MenuOptions {
  navWrapper: (nav: TemplateResult | typeof nothing) => TemplateResult;
  navLabel: string | TemplateResult;
  navHeader: string | TemplateResult;
}
