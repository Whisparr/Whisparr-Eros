declare namespace UMaskInputModuleCssNamespace {
  export interface IUMaskInputModuleCss {
    details: string;
    inputFolder: string;
    inputUnit: string;
    inputUnitWrapper: string;
    inputWrapper: string;
    readOnly: string;
    unit: string;
    value: string;
  }
}

declare const UMaskInputModuleCssModule: UMaskInputModuleCssNamespace.IUMaskInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: UMaskInputModuleCssNamespace.IUMaskInputModuleCss;
};

export = UMaskInputModuleCssModule;
