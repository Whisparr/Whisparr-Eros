declare namespace TagsModalContentModuleCssNamespace {
  export interface ITagsModalContentModuleCss {
    message: string;
    renameIcon: string;
    result: string;
  }
}

declare const TagsModalContentModuleCssModule: TagsModalContentModuleCssNamespace.ITagsModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagsModalContentModuleCssNamespace.ITagsModalContentModuleCss;
};

export = TagsModalContentModuleCssModule;
