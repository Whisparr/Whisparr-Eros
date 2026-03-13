declare namespace CustomFilterCssNamespace {
  export interface ICustomFilterCss {
    actions: string;
    customFilter: string;
    label: string;
  }
}

declare const CustomFilterCssModule: CustomFilterCssNamespace.ICustomFilterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CustomFilterCssNamespace.ICustomFilterCss;
};

export = CustomFilterCssModule;
