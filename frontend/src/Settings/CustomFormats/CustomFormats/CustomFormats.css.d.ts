declare namespace CustomFormatsCssNamespace {
  export interface ICustomFormatsCss {
    addCustomFormat: string;
    center: string;
    customFormats: string;
  }
}

declare const CustomFormatsCssModule: CustomFormatsCssNamespace.ICustomFormatsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CustomFormatsCssNamespace.ICustomFormatsCss;
};

export = CustomFormatsCssModule;
