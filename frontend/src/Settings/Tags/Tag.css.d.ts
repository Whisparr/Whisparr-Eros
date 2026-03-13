declare namespace TagCssNamespace {
  export interface ITagCss {
    label: string;
    tag: string;
  }
}

declare const TagCssModule: TagCssNamespace.ITagCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagCssNamespace.ITagCss;
};

export = TagCssModule;
