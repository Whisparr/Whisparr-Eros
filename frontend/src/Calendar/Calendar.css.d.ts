declare namespace CalendarCssNamespace {
  export interface ICalendarCss {
    calendar: string;
    calendarContent: string;
  }
}

declare const CalendarCssModule: CalendarCssNamespace.ICalendarCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CalendarCssNamespace.ICalendarCss;
};

export = CalendarCssModule;
