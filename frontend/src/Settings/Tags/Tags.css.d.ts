declare namespace TagsCssNamespace {
  export interface ITagsCss {
    tags: string;
  }
}

declare const TagsCssModule: TagsCssNamespace.ITagsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagsCssNamespace.ITagsCss;
};

export = TagsCssModule;
