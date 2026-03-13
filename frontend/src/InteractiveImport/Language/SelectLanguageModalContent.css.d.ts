declare namespace SelectLanguageModalContentCssNamespace {
  export interface ISelectLanguageModalContentCss {
    languageInput: string;
  }
}

declare const SelectLanguageModalContentCssModule: SelectLanguageModalContentCssNamespace.ISelectLanguageModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectLanguageModalContentCssNamespace.ISelectLanguageModalContentCss;
};

export = SelectLanguageModalContentCssModule;
