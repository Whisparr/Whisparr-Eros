declare namespace ExtraFileTableContentModuleCssNamespace {
  export interface IExtraFileTableContentModuleCss {
    actions: string;
    blankpad: string;
  }
}

declare const ExtraFileTableContentModuleCssModule: ExtraFileTableContentModuleCssNamespace.IExtraFileTableContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ExtraFileTableContentModuleCssNamespace.IExtraFileTableContentModuleCss;
};

export = ExtraFileTableContentModuleCssModule;
