declare namespace AgendaEventCssNamespace {
  export interface IAgendaEventCss {
    continuing: string;
    date: string;
    downloaded: string;
    event: string;
    eventWrapper: string;
    genres: string;
    missingMonitored: string;
    missingUnmonitored: string;
    movieTitle: string;
    overlay: string;
    queue: string;
    releaseIcon: string;
    statusIcon: string;
    time: string;
    underlay: string;
    unmonitored: string;
  }
}

declare const AgendaEventCssModule: AgendaEventCssNamespace.IAgendaEventCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AgendaEventCssNamespace.IAgendaEventCss;
};

export = AgendaEventCssModule;
