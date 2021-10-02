import unified from 'unified';

import { MetaPlugin } from 'plugins-manager';

export type StoryTypes = 'js' | 'html';

export interface MarkdownResult {
  html: string;
  jsCode: string;
  stories: Story[];
}

export interface Story {
  key: string;
  name: string;
  code: string;
  type?: StoryTypes;
}

export interface ProcessResult {
  jsCode: string;
  allHtml: string[];
}

export interface ParseResult {
  contents: string;
  data: {
    stories: Story[];
    jsCode: string;
    setupJsCode: string;
  };
}

export type MdjsProcessPlugin = MetaPlugin<unified.Plugin>;
