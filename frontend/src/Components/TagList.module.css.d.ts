declare namespace TagListModuleCssNamespace {
  export interface ITagListModuleCss {
    tags: string;
  }
}

declare const TagListModuleCssModule: TagListModuleCssNamespace.ITagListModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagListModuleCssNamespace.ITagListModuleCss;
};

export = TagListModuleCssModule;
