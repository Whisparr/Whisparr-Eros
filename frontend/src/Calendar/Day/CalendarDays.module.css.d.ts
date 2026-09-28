declare namespace CalendarDaysModuleCssNamespace {
  export interface ICalendarDaysModuleCss {
    day: string;
    days: string;
    forecast: string;
    month: string;
    week: string;
  }
}

declare const CalendarDaysModuleCssModule: CalendarDaysModuleCssNamespace.ICalendarDaysModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CalendarDaysModuleCssNamespace.ICalendarDaysModuleCss;
};

export = CalendarDaysModuleCssModule;
