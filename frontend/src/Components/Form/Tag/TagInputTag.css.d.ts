declare namespace TagInputTagCssNamespace {
  export interface ITagInputTagCss {
    editButton: string;
    editContainer: string;
    label: string;
    link: string;
    linkWithEdit: string;
    tag: string;
  }
}

declare const TagInputTagCssModule: TagInputTagCssNamespace.ITagInputTagCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagInputTagCssNamespace.ITagInputTagCss;
};

export = TagInputTagCssModule;
