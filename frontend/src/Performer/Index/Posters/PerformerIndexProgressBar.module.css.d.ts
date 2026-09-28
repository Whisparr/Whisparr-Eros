declare namespace PerformerIndexProgressBarModuleCssNamespace {
  export interface IPerformerIndexProgressBarModuleCss {
    progress: string;
    progressBar: string;
    progressRadius: string;
  }
}

declare const PerformerIndexProgressBarModuleCssModule: PerformerIndexProgressBarModuleCssNamespace.IPerformerIndexProgressBarModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerIndexProgressBarModuleCssNamespace.IPerformerIndexProgressBarModuleCss;
};

export = PerformerIndexProgressBarModuleCssModule;
