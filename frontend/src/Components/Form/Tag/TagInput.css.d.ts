declare namespace TagInputCssNamespace {
  export interface ITagInputCss {
    hasError: string;
    hasWarning: string;
    input: string;
    internalInput: string;
    isFocused: string;
  }
}

declare const TagInputCssModule: TagInputCssNamespace.ITagInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagInputCssNamespace.ITagInputCss;
};

export = TagInputCssModule;
