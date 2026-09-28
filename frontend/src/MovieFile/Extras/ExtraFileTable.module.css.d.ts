declare namespace ExtraFileTableModuleCssNamespace {
  export interface IExtraFileTableModuleCss {
    container: string;
  }
}

declare const ExtraFileTableModuleCssModule: ExtraFileTableModuleCssNamespace.IExtraFileTableModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ExtraFileTableModuleCssNamespace.IExtraFileTableModuleCss;
};

export = ExtraFileTableModuleCssModule;
