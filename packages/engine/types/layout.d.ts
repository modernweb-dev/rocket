import { ClassInfo } from 'lit/directives/class-map.js';
import { TemplateResult, nothing } from 'lit';
import { PageTree } from '../src/index.js';

export type TemplateValue =
  | TemplateResult
  | ((data: any) => TemplateResult)
  | string
  | ((data: any) => string)
  | typeof nothing
  | ((data: any) => typeof nothing);

export type LayoutValue = TemplateResult | string;

export type TemplateValueKey<Str extends string> = `${Str}__${number}`;

export interface LayoutOptions {
  lang: string;
  bodyClasses: ClassInfo;
  bodyLayout: string;
  dsdPending: boolean;
  pageTree?: PageTree;
  [key: TemplateValueKey<'head'>]: TemplateValue;
  [key: TemplateValueKey<'header'>]: TemplateValue;
  [key: TemplateValueKey<'top'>]: TemplateValue;
  [key: TemplateValueKey<'content'>]: TemplateValue;
  [key: TemplateValueKey<'bottom'>]: TemplateValue;
  [key: TemplateValueKey<'footer'>]: TemplateValue;

  /**
   * This gets filled by default with the value of markdown (*.rocket.md), html (*.rocket.html), export default (*.rocket.js)
   */
  content__500: TemplateValue;
}

export interface renderData {
  content: TemplateResult | string | typeof nothing;
  sourceFilePath: string;
  outputFilePath: string;
  sourceRelativeFilePath: string;
  outputRelativeFilePath: string;
  url: string;
  renderMode: string;
  openGraphOutputFilePath: string;
  openGraphOutputRelativeFilePath: string;
  openGraphUrl: string;
  [key: string]: unknown;
}
