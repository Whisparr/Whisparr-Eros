declare namespace SelectLanguageModalContentModuleCssNamespace {
  export interface ISelectLanguageModalContentModuleCss {
    languageInput: string;
  }
}

declare const SelectLanguageModalContentModuleCssModule: SelectLanguageModalContentModuleCssNamespace.ISelectLanguageModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectLanguageModalContentModuleCssNamespace.ISelectLanguageModalContentModuleCss;
};

export = SelectLanguageModalContentModuleCssModule;
