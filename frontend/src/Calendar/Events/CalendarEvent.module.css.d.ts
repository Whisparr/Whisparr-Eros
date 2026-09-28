declare namespace CalendarEventModuleCssNamespace {
  export interface ICalendarEventModuleCss {
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

declare const CalendarEventModuleCssModule: CalendarEventModuleCssNamespace.ICalendarEventModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CalendarEventModuleCssNamespace.ICalendarEventModuleCss;
};

export = CalendarEventModuleCssModule;
