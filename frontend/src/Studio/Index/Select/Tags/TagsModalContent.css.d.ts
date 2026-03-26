declare namespace TagsModalContentCssNamespace {
  export interface ITagsModalContentCss {
    message: string;
    renameIcon: string;
    result: string;
  }
}

declare const TagsModalContentCssModule: TagsModalContentCssNamespace.ITagsModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagsModalContentCssNamespace.ITagsModalContentCss;
};

export = TagsModalContentCssModule;
