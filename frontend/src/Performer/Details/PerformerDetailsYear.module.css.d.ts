declare namespace PerformerDetailsYearModuleCssNamespace {
  export interface IPerformerDetailsYearModuleCss {
    actionButton: string;
    actionMenuIcon: string;
    actionsMenu: string;
    actionsMenuContent: string;
    collapseButtonContainer: string;
    expandButton: string;
    expandButtonIcon: string;
    footer: string;
    header: string;
    headerCenter: string;
    headerRight: string;
    hearerLeft: string;
    monitorToggleButton: string;
    movieCountTooltip: string;
    noEpisodes: string;
    refreshButton: string;
    searchButton: string;
    sizeOnDisk: string;
    year: string;
    yearNumber: string;
  }
}

declare const PerformerDetailsYearModuleCssModule: PerformerDetailsYearModuleCssNamespace.IPerformerDetailsYearModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerDetailsYearModuleCssNamespace.IPerformerDetailsYearModuleCss;
};

export = PerformerDetailsYearModuleCssModule;
