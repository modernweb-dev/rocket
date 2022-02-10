import { Node, TreeModel } from '@dakmor/tree-model';
import { TemplateResult } from 'lit';

export class Page {
  level: string;
  url: string;
  children: Node<Page>;
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
  // tableOfContentsNode
}

export type NodeOfPage = Node<Page>;
export type TreeModelOfPage = TreeModel<Page>;

export interface MenuOptions {
  label: string;
  type: string;
}

export interface IndexMenuOptions extends MenuOptions {
  navWrapper: (nav: TemplateResult | nothing) => TemplateResult;
}

export interface ChildListMenuOptions extends MenuOptions {
  maxDepth: number;
}

export interface TableOfContentsMenuOptions extends MenuOptions {
  navWrapper: (nav: TemplateResult | nothing) => TemplateResult;
  navLabel: string | TemplateResult;
  navHeader: string | TemplateResult;
}
