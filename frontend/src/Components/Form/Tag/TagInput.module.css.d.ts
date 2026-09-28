declare namespace TagInputModuleCssNamespace {
  export interface ITagInputModuleCss {
    hasError: string;
    hasWarning: string;
    input: string;
    internalInput: string;
    isFocused: string;
  }
}

declare const TagInputModuleCssModule: TagInputModuleCssNamespace.ITagInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagInputModuleCssNamespace.ITagInputModuleCss;
};

export = TagInputModuleCssModule;
