declare namespace TagInputInputModuleCssNamespace {
  export interface ITagInputInputModuleCss {
    inputContainer: string;
  }
}

declare const TagInputInputModuleCssModule: TagInputInputModuleCssNamespace.ITagInputInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagInputInputModuleCssNamespace.ITagInputInputModuleCss;
};

export = TagInputInputModuleCssModule;
