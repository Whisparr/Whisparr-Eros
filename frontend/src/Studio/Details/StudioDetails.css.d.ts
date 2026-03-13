declare namespace StudioDetailsCssNamespace {
  export interface IStudioDetailsCss {
    aliases: string;
    alternateTitlesIconContainer: string;
    backdrop: string;
    backdropOverlay: string;
    blurred: string;
    certification: string;
    contentContainer: string;
    details: string;
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
    monitorToggleButtonsContainer: string;
    movieCount: string;
    movieNavigationButton: string;
    movieNavigationButtons: string;
    network: string;
    overview: string;
    path: string;
    poster: string;
    qualityProfileName: string;
    rating: string;
    runtime: string;
    sceneCount: string;
    selectedTab: string;
    sizeOnDisk: string;
    statusName: string;
    studio: string;
    tab: string;
    tabContent: string;
    tabList: string;
    tags: string;
    title: string;
    titleContainer: string;
    titleRow: string;
    toggleMonitoredContainer: string;
    toggleMoviesMonitoredContainer: string;
    unmonitored: string;
    year: string;
    yearRow: string;
    yearRowCollapsed: string;
    yearRowExpanded: string;
    years: string;
  }
}

declare const StudioDetailsCssModule: StudioDetailsCssNamespace.IStudioDetailsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioDetailsCssNamespace.IStudioDetailsCss;
};

export = StudioDetailsCssModule;
