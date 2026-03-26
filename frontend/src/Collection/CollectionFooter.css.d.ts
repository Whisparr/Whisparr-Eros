declare namespace CollectionFooterCssNamespace {
  export interface ICollectionFooterCss {
    addSelectedButton: string;
    buttonContainer: string;
    buttonContainerContent: string;
    buttons: string;
    excludeSelectedButton: string;
    inputContainer: string;
    selectedMovieLabel: string;
  }
}

declare const CollectionFooterCssModule: CollectionFooterCssNamespace.ICollectionFooterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CollectionFooterCssNamespace.ICollectionFooterCss;
};

export = CollectionFooterCssModule;
