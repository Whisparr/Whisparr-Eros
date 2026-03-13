declare namespace CalendarDaysCssNamespace {
  export interface ICalendarDaysCss {
    day: string;
    days: string;
    forecast: string;
    month: string;
    week: string;
  }
}

declare const CalendarDaysCssModule: CalendarDaysCssNamespace.ICalendarDaysCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CalendarDaysCssNamespace.ICalendarDaysCss;
};

export = CalendarDaysCssModule;
