import { MdjsProcessPlugin } from '@mdjs/core';
import { Node } from 'unist';

export const setupUnifiedPluginsFn: (plugins: MdjsProcessPlugin[]) => MdjsProcessPlugin[];

export interface EleventPluginMdjsUnified {
  setupUnifiedPlugins?: setupUnifiedPluginsFn[];
}

export interface NodeChildren extends Node {
  children: Node[];
}

export interface NodeElement extends Node {
  properties: {
    href: string;
  };
}
