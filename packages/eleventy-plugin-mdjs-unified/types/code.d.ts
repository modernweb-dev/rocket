import { MdjsProcessPlugin } from '@mdjs/core';
import { Node } from 'unist';

export type SetupUnifiedPluginsFn = (plugins: MdjsProcessPlugin[]) => MdjsProcessPlugin[];

export interface EleventyPluginMdjsUnified {
  setupUnifiedPlugins?: SetupUnifiedPluginsFn[];
}

export interface NodeChildren extends Node {
  children: Node[];
}

export interface NodeElement extends Node {
  properties: {
    href: string;
  };
}
