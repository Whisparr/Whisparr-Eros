declare namespace CustomFormatCssNamespace {
  export interface ICustomFormatCss {
    buttons: string;
    cloneButton: string;
    customFormat: string;
    formats: string;
    label: string;
    name: string;
    nameContainer: string;
    tooltipLabel: string;
  }
}

declare const CustomFormatCssModule: CustomFormatCssNamespace.ICustomFormatCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CustomFormatCssNamespace.ICustomFormatCss;
};

export = CustomFormatCssModule;
