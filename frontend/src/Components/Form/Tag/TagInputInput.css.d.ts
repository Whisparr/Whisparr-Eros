declare namespace TagInputInputCssNamespace {
  export interface ITagInputInputCss {
    inputContainer: string;
  }
}

declare const TagInputInputCssModule: TagInputInputCssNamespace.ITagInputInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagInputInputCssNamespace.ITagInputInputCss;
};

export = TagInputInputCssModule;
