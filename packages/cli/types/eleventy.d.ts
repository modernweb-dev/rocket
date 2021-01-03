declare module '@11ty/eleventy' {
  interface Page {
    inputPath: string;
    outputPath: string;
    data: any;
  }

  class Eleventy {
    constructor(input: string, output: string);
    watch();

    setConfigPathOverride(path: string);
    init(): Promise<void>;
    write(): Promise<void>;
    finish(): void;

    isVerbose: boolean;

    writer: {
      templateMap: {
        _collection: {
          items: Page[];
        };
      };
    };
  }

  export = Eleventy;
}
