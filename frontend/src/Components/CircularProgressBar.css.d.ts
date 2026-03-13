declare namespace CircularProgressBarCssNamespace {
  export interface ICircularProgressBarCss {
    circularProgressBar: string;
    circularProgressBarContainer: string;
    circularProgressBarText: string;
  }
}

declare const CircularProgressBarCssModule: CircularProgressBarCssNamespace.ICircularProgressBarCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CircularProgressBarCssNamespace.ICircularProgressBarCss;
};

export = CircularProgressBarCssModule;
