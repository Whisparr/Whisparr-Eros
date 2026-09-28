declare namespace KeyValueListInputItemModuleCssNamespace {
  export interface IKeyValueListInputItemModuleCss {
    buttonWrapper: string;
    itemContainer: string;
    keyInput: string;
    keyInputWrapper: string;
    valueInput: string;
    valueInputWrapper: string;
  }
}

declare const KeyValueListInputItemModuleCssModule: KeyValueListInputItemModuleCssNamespace.IKeyValueListInputItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: KeyValueListInputItemModuleCssNamespace.IKeyValueListInputItemModuleCss;
};

export = KeyValueListInputItemModuleCssModule;
