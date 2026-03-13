declare namespace StudioIndexProgressBarCssNamespace {
  export interface IStudioIndexProgressBarCss {
    progress: string;
    progressBar: string;
    progressRadius: string;
  }
}

declare const StudioIndexProgressBarCssModule: StudioIndexProgressBarCssNamespace.IStudioIndexProgressBarCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioIndexProgressBarCssNamespace.IStudioIndexProgressBarCss;
};

export = StudioIndexProgressBarCssModule;
