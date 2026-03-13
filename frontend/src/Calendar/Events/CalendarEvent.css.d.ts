declare namespace CalendarEventCssNamespace {
  export interface ICalendarEventCss {
    continuing: string;
    downloaded: string;
    event: string;
    eventType: string;
    genres: string;
    info: string;
    missingMonitored: string;
    missingUnmonitored: string;
    movieInfo: string;
    movieTitle: string;
    overlay: string;
    queue: string;
    statusContainer: string;
    statusIcon: string;
    underlay: string;
    unmonitored: string;
  }
}

declare const CalendarEventCssModule: CalendarEventCssNamespace.ICalendarEventCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CalendarEventCssNamespace.ICalendarEventCss;
};

export = CalendarEventCssModule;
