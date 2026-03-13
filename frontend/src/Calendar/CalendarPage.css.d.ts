declare namespace CalendarPageCssNamespace {
  export interface ICalendarPageCss {
    calendarInnerPageBody: string;
    calendarPageBody: string;
    errorMessage: string;
  }
}

declare const CalendarPageCssModule: CalendarPageCssNamespace.ICalendarPageCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CalendarPageCssNamespace.ICalendarPageCss;
};

export = CalendarPageCssModule;
