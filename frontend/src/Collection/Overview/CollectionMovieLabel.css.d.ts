declare namespace CollectionMovieLabelCssNamespace {
  export interface ICollectionMovieLabelCss {
    danger: string;
    info: string;
    movie: string;
    movieStatus: string;
    movieTitle: string;
    primary: string;
    purple: string;
    queue: string;
    success: string;
    warning: string;
  }
}

declare const CollectionMovieLabelCssModule: CollectionMovieLabelCssNamespace.ICollectionMovieLabelCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CollectionMovieLabelCssNamespace.ICollectionMovieLabelCss;
};

export = CollectionMovieLabelCssModule;
