declare namespace NoSceneModuleCssNamespace {
  export interface INoSceneModuleCss {
    buttonContainer: string;
    message: string;
  }
}

declare const NoSceneModuleCssModule: NoSceneModuleCssNamespace.INoSceneModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NoSceneModuleCssNamespace.INoSceneModuleCss;
};

export = NoSceneModuleCssModule;
