declare namespace PerformerIndexProgressBarCssNamespace {
  export interface IPerformerIndexProgressBarCss {
    progress: string;
    progressBar: string;
    progressRadius: string;
  }
}

declare const PerformerIndexProgressBarCssModule: PerformerIndexProgressBarCssNamespace.IPerformerIndexProgressBarCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerIndexProgressBarCssNamespace.IPerformerIndexProgressBarCss;
};

export = PerformerIndexProgressBarCssModule;
