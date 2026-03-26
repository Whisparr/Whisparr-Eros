declare namespace CollectionOverviewCssNamespace {
  export interface ICollectionOverviewCss {
    actions: string;
    content: string;
    defaults: string;
    details: string;
    detailsLabel: string;
    editorSelect: string;
    genres: string;
    info: string;
    labelsContainer: string;
    monitorToggleButton: string;
    movie: string;
    moviesContainer: string;
    navigationButtons: string;
    overview: string;
    path: string;
    qualityProfileName: string;
    sliderContainer: string;
    status: string;
    title: string;
    titleContainer: string;
    titleRow: string;
    toggleMonitoredContainer: string;
  }
}

declare const CollectionOverviewCssModule: CollectionOverviewCssNamespace.ICollectionOverviewCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CollectionOverviewCssNamespace.ICollectionOverviewCss;
};

export = CollectionOverviewCssModule;
