declare namespace UMaskInputCssNamespace {
  export interface IUMaskInputCss {
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

declare const UMaskInputCssModule: UMaskInputCssNamespace.IUMaskInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: UMaskInputCssNamespace.IUMaskInputCss;
};

export = UMaskInputCssModule;
