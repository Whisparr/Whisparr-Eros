declare namespace CalendarModuleCssNamespace {
  export interface ICalendarModuleCss {
    calendar: string;
    calendarContent: string;
  }
}

declare const CalendarModuleCssModule: CalendarModuleCssNamespace.ICalendarModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CalendarModuleCssNamespace.ICalendarModuleCss;
};

export = CalendarModuleCssModule;
