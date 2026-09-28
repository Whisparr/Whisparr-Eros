declare namespace SpinnerErrorButtonModuleCssNamespace {
  export interface ISpinnerErrorButtonModuleCss {
    icon: string;
    iconContainer: string;
    label: string;
    showIcon: string;
  }
}

declare const SpinnerErrorButtonModuleCssModule: SpinnerErrorButtonModuleCssNamespace.ISpinnerErrorButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SpinnerErrorButtonModuleCssNamespace.ISpinnerErrorButtonModuleCss;
};

export = SpinnerErrorButtonModuleCssModule;
