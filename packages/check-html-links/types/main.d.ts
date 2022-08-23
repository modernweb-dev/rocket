export interface Link {
  value: string;
  attribute: string;
  htmlFilePath: string;
  line: number;
  character: number;
}

export interface Usage {
  attribute: string;
  value: string;
  anchor: string;
  file: string;
  line: number;
  character: number;
}

export interface LocalFile {
  filePath: string;
  usage: Usage[];
}

export interface Error {
  filePath: string;
  onlyAnchorMissing: boolean;
  usage: Usage[];
}

export interface Options {
  ignoreLinkPatterns: string[] | null;
  validateExternals: boolean;
  absoluteBaseUrl: string;
}

export interface CheckHtmlLinksCliOptions extends Options {
  printOnError: boolean;
  rootDir: string;
  continueOnError: boolean;
  absoluteBaseUrl: string;
}
