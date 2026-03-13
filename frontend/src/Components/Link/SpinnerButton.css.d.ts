declare namespace SpinnerButtonCssNamespace {
  export interface ISpinnerButtonCss {
    button: string;
    isSpinning: string;
    label: string;
    spinner: string;
    spinnerContainer: string;
  }
}

declare const SpinnerButtonCssModule: SpinnerButtonCssNamespace.ISpinnerButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SpinnerButtonCssNamespace.ISpinnerButtonCss;
};

export = SpinnerButtonCssModule;
