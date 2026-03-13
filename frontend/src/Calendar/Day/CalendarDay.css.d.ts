declare namespace CalendarDayCssNamespace {
  export interface ICalendarDayCss {
    day: string;
    dayOfMonth: string;
    isDifferentMonth: string;
    isSingleDay: string;
    isToday: string;
  }
}

declare const CalendarDayCssModule: CalendarDayCssNamespace.ICalendarDayCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CalendarDayCssNamespace.ICalendarDayCss;
};

export = CalendarDayCssModule;
