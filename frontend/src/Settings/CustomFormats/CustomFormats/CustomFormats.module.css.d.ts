declare namespace CustomFormatsModuleCssNamespace {
  export interface ICustomFormatsModuleCss {
    addCustomFormat: string;
    center: string;
    customFormats: string;
  }
}

declare const CustomFormatsModuleCssModule: CustomFormatsModuleCssNamespace.ICustomFormatsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CustomFormatsModuleCssNamespace.ICustomFormatsModuleCss;
};

export = CustomFormatsModuleCssModule;
