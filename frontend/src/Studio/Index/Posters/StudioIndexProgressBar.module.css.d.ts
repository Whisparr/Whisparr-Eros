declare namespace StudioIndexProgressBarModuleCssNamespace {
  export interface IStudioIndexProgressBarModuleCss {
    progress: string;
    progressBar: string;
    progressRadius: string;
  }
}

declare const StudioIndexProgressBarModuleCssModule: StudioIndexProgressBarModuleCssNamespace.IStudioIndexProgressBarModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioIndexProgressBarModuleCssNamespace.IStudioIndexProgressBarModuleCss;
};

export = StudioIndexProgressBarModuleCssModule;
