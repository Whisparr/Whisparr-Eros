declare namespace StudioDetailsYearCssNamespace {
  export interface IStudioDetailsYearCss {
    actionButton: string;
    actionMenuIcon: string;
    actions: string;
    actionsMenu: string;
    actionsMenuContent: string;
    collapseButtonContainer: string;
    collapseButtonIcon: string;
    episodes: string;
    expandButton: string;
    expandButtonIcon: string;
    header: string;
    left: string;
    movieCountTooltip: string;
    noEpisodes: string;
    season: string;
    seasonNumber: string;
    sizeOnDisk: string;
  }
}

declare const StudioDetailsYearCssModule: StudioDetailsYearCssNamespace.IStudioDetailsYearCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioDetailsYearCssNamespace.IStudioDetailsYearCss;
};

export = StudioDetailsYearCssModule;
