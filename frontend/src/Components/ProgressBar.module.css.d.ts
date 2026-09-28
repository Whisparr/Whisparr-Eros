declare namespace ProgressBarModuleCssNamespace {
  export interface IProgressBarModuleCss {
    backText: string;
    backTextContainer: string;
    container: string;
    danger: string;
    default: string;
    frontText: string;
    frontTextContainer: string;
    info: string;
    inverse: string;
    large: string;
    medium: string;
    primary: string;
    progressBar: string;
    purple: string;
    queue: string;
    small: string;
    success: string;
    warning: string;
  }
}

declare const ProgressBarModuleCssModule: ProgressBarModuleCssNamespace.IProgressBarModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ProgressBarModuleCssNamespace.IProgressBarModuleCss;
};

export = ProgressBarModuleCssModule;
