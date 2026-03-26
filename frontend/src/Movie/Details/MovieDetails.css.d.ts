declare namespace MovieDetailsCssNamespace {
  export interface IMovieDetailsCss {
    alternateTitlesIconContainer: string;
    backdrop: string;
    backdropOverlay: string;
    certification: string;
    code: string;
    collection: string;
    contentContainer: string;
    details: string;
    detailsInfoLabel: string;
    detailsInfoLabelContainer: string;
    detailsLabel: string;
    errorMessage: string;
    filterIcon: string;
    genres: string;
    header: string;
    headerContent: string;
    info: string;
    innerContentBody: string;
    links: string;
    monitorToggleButton: string;
    movieNavigationButton: string;
    movieNavigationButtons: string;
    overview: string;
    path: string;
    poster: string;
    qualityProfileName: string;
    rating: string;
    releaseDate: string;
    runtime: string;
    sceneHeader: string;
    screenshot: string;
    selectedTab: string;
    sizeOnDisk: string;
    statusName: string;
    studio: string;
    tab: string;
    tabContent: string;
    tabList: string;
    title: string;
    titleContainer: string;
    titleRow: string;
    toggleMonitoredContainer: string;
    year: string;
  }
}

declare const MovieDetailsCssModule: MovieDetailsCssNamespace.IMovieDetailsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieDetailsCssNamespace.IMovieDetailsCss;
};

export = MovieDetailsCssModule;
