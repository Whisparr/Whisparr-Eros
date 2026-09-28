declare namespace CustomFormatModuleCssNamespace {
  export interface ICustomFormatModuleCss {
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

declare const CustomFormatModuleCssModule: CustomFormatModuleCssNamespace.ICustomFormatModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CustomFormatModuleCssNamespace.ICustomFormatModuleCss;
};

export = CustomFormatModuleCssModule;
