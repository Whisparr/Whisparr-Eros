declare namespace CollectionMovieLabelModuleCssNamespace {
  export interface ICollectionMovieLabelModuleCss {
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

declare const CollectionMovieLabelModuleCssModule: CollectionMovieLabelModuleCssNamespace.ICollectionMovieLabelModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CollectionMovieLabelModuleCssNamespace.ICollectionMovieLabelModuleCss;
};

export = CollectionMovieLabelModuleCssModule;
