declare namespace PerformerDetailsCssNamespace {
  export interface IPerformerDetailsCss {
    age: string;
    alternateTitlesIconContainer: string;
    backdrop: string;
    backdropOverlay: string;
    birthDate: string;
    blurred: string;
    certification: string;
    contentContainer: string;
    country: string;
    details: string;
    detailsLabel: string;
    errorMessage: string;
    ethnicity: string;
    filterIcon: string;
    gender: string;
    genres: string;
    header: string;
    headerContent: string;
    info: string;
    innerContentBody: string;
    links: string;
    metadata: string;
    metadataLabel: string;
    monitorToggleButton: string;
    monitorToggleButtonsContainer: string;
    movieCount: string;
    movieNavigationButton: string;
    movieNavigationButtons: string;
    overview: string;
    path: string;
    performerName: string;
    poster: string;
    qualityProfileName: string;
    rating: string;
    runtime: string;
    sceneCount: string;
    scenesFieldSet: string;
    selectedTab: string;
    sizeOnDisk: string;
    status: string;
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
    years: string;
  }
}

declare const PerformerDetailsCssModule: PerformerDetailsCssNamespace.IPerformerDetailsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerDetailsCssNamespace.IPerformerDetailsCss;
};

export = PerformerDetailsCssModule;
