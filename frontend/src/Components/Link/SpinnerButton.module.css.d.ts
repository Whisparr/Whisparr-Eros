declare namespace SpinnerButtonModuleCssNamespace {
  export interface ISpinnerButtonModuleCss {
    button: string;
    isSpinning: string;
    label: string;
    spinner: string;
    spinnerContainer: string;
  }
}

declare const SpinnerButtonModuleCssModule: SpinnerButtonModuleCssNamespace.ISpinnerButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SpinnerButtonModuleCssNamespace.ISpinnerButtonModuleCss;
};

export = SpinnerButtonModuleCssModule;
