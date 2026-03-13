declare namespace TagListCssNamespace {
  export interface ITagListCss {
    tags: string;
  }
}

declare const TagListCssModule: TagListCssNamespace.ITagListCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagListCssNamespace.ITagListCss;
};

export = TagListCssModule;
