declare namespace CollectionMovieCssNamespace {
  export interface ICollectionMovieCss {
    action: string;
    container: string;
    content: string;
    controls: string;
    editorSelect: string;
    excluded: string;
    externalLinks: string;
    link: string;
    monitorToggleButton: string;
    overlayHover: string;
    overlayHoverTitle: string;
    overlayTitle: string;
    poster: string;
    posterContainer: string;
    title: string;
  }
}

declare const CollectionMovieCssModule: CollectionMovieCssNamespace.ICollectionMovieCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CollectionMovieCssNamespace.ICollectionMovieCss;
};

export = CollectionMovieCssModule;
