declare namespace TagInputTagModuleCssNamespace {
  export interface ITagInputTagModuleCss {
    editButton: string;
    editContainer: string;
    label: string;
    link: string;
    linkWithEdit: string;
    tag: string;
  }
}

declare const TagInputTagModuleCssModule: TagInputTagModuleCssNamespace.ITagInputTagModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagInputTagModuleCssNamespace.ITagInputTagModuleCss;
};

export = TagInputTagModuleCssModule;
