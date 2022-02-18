import { ClassInfo } from 'lit/directives/class-map.js';
import { TemplateResult, nothing } from 'lit';

type TemplateValue =
  | TemplateResult
  | ((data: any) => TemplateResult)
  | string
  | ((data: any) => string)
  | typeof nothing
  | ((data: any) => typeof nothing);

type TemplateValueKey<Str extends string> = `${Str}__${number}`;

export interface LayoutOptions {
  lang: string;
  bodyClasses: ClassInfo;
  bodyLayout: string;
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


export interface renderOptions {
  content: TemplateResult | string | typeof nothing;
  [key: string]: unknown;
}
