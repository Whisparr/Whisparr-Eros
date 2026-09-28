declare namespace AuthenticationRequiredModalContentModuleCssNamespace {
  export interface IAuthenticationRequiredModalContentModuleCss {
    authRequiredAlert: string;
  }
}

declare const AuthenticationRequiredModalContentModuleCssModule: AuthenticationRequiredModalContentModuleCssNamespace.IAuthenticationRequiredModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AuthenticationRequiredModalContentModuleCssNamespace.IAuthenticationRequiredModalContentModuleCss;
};

export = AuthenticationRequiredModalContentModuleCssModule;
