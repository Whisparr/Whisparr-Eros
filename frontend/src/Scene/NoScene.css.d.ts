declare namespace NoSceneCssNamespace {
  export interface INoSceneCss {
    buttonContainer: string;
    message: string;
  }
}

declare const NoSceneCssModule: NoSceneCssNamespace.INoSceneCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NoSceneCssNamespace.INoSceneCss;
};

export = NoSceneCssModule;
