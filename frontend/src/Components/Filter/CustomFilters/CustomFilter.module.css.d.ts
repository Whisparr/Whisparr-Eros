declare namespace CustomFilterModuleCssNamespace {
  export interface ICustomFilterModuleCss {
    actions: string;
    customFilter: string;
    label: string;
  }
}

declare const CustomFilterModuleCssModule: CustomFilterModuleCssNamespace.ICustomFilterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CustomFilterModuleCssNamespace.ICustomFilterModuleCss;
};

export = CustomFilterModuleCssModule;
