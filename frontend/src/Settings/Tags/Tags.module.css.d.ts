declare namespace TagsModuleCssNamespace {
  export interface ITagsModuleCss {
    tags: string;
  }
}

declare const TagsModuleCssModule: TagsModuleCssNamespace.ITagsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagsModuleCssNamespace.ITagsModuleCss;
};

export = TagsModuleCssModule;
