import { Node, TreeModel } from '@dakmor/tree-model';

class Page {
  level: string;
  url: string;
  children: Node<Page>;
  order?: number;
  active?: boolean;
  // tableOfContentsNode
}

export type NodeOfPage = Node<Page>;

export type TreeModelOfPage = TreeModel<Page>;
