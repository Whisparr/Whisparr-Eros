declare namespace AuthenticationRequiredModalContentCssNamespace {
  export interface IAuthenticationRequiredModalContentCss {
    authRequiredAlert: string;
  }
}

declare const AuthenticationRequiredModalContentCssModule: AuthenticationRequiredModalContentCssNamespace.IAuthenticationRequiredModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AuthenticationRequiredModalContentCssNamespace.IAuthenticationRequiredModalContentCss;
};

export = AuthenticationRequiredModalContentCssModule;
