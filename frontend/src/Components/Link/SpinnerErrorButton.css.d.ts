declare namespace SpinnerErrorButtonCssNamespace {
  export interface ISpinnerErrorButtonCss {
    icon: string;
    iconContainer: string;
    label: string;
    showIcon: string;
  }
}

declare const SpinnerErrorButtonCssModule: SpinnerErrorButtonCssNamespace.ISpinnerErrorButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SpinnerErrorButtonCssNamespace.ISpinnerErrorButtonCss;
};

export = SpinnerErrorButtonCssModule;
