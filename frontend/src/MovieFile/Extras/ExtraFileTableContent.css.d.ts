declare namespace ExtraFileTableContentCssNamespace {
  export interface IExtraFileTableContentCss {
    actions: string;
    blankpad: string;
  }
}

declare const ExtraFileTableContentCssModule: ExtraFileTableContentCssNamespace.IExtraFileTableContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ExtraFileTableContentCssNamespace.IExtraFileTableContentCss;
};

export = ExtraFileTableContentCssModule;
