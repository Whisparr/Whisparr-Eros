declare namespace CaptchaInputModuleCssNamespace {
  export interface ICaptchaInputModuleCss {
    captchaInputWrapper: string;
    hasButton: string;
    hasError: string;
    hasWarning: string;
    input: string;
    recaptchaWrapper: string;
  }
}

declare const CaptchaInputModuleCssModule: CaptchaInputModuleCssNamespace.ICaptchaInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CaptchaInputModuleCssNamespace.ICaptchaInputModuleCss;
};

export = CaptchaInputModuleCssModule;
