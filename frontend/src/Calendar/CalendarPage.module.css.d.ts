declare namespace CalendarPageModuleCssNamespace {
  export interface ICalendarPageModuleCss {
    calendarInnerPageBody: string;
    calendarPageBody: string;
    errorMessage: string;
  }
}

declare const CalendarPageModuleCssModule: CalendarPageModuleCssNamespace.ICalendarPageModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CalendarPageModuleCssNamespace.ICalendarPageModuleCss;
};

export = CalendarPageModuleCssModule;
