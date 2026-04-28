/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ComponentImports {
  [key: string]: () => Promise<any>;
}

export interface Strategy {
  type: string;
  resolveAble: boolean;
  options?: string;
}

export interface LoadingStrategy {
  strategyAttribute: string;
  strategies: Strategy[];
  strategyTemplate: string;
}

interface PotentialLitElement extends Element {
  updateComplete?: Promise<void>;
}

export interface ElementWithStrategy extends LoadingStrategy {
  tagName: string;
  node: PotentialLitElement;
  deleteMe?: boolean;
}
