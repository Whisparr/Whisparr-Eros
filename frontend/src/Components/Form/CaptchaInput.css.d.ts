declare namespace CaptchaInputCssNamespace {
  export interface ICaptchaInputCss {
    captchaInputWrapper: string;
    hasButton: string;
    hasError: string;
    hasWarning: string;
    input: string;
    recaptchaWrapper: string;
  }
}

declare const CaptchaInputCssModule: CaptchaInputCssNamespace.ICaptchaInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CaptchaInputCssNamespace.ICaptchaInputCss;
};

export = CaptchaInputCssModule;
