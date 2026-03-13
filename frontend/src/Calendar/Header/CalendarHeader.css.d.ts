declare namespace CalendarHeaderCssNamespace {
  export interface ICalendarHeaderCss {
    header: string;
    loading: string;
    navigationButtons: string;
    titleDesktop: string;
    titleMobile: string;
    todayButton: string;
    viewButtonsContainer: string;
    viewMenu: string;
  }
}

declare const CalendarHeaderCssModule: CalendarHeaderCssNamespace.ICalendarHeaderCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CalendarHeaderCssNamespace.ICalendarHeaderCss;
};

export = CalendarHeaderCssModule;
