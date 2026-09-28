declare namespace CalendarHeaderModuleCssNamespace {
  export interface ICalendarHeaderModuleCss {
    datePicker: string;
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

declare const CalendarHeaderModuleCssModule: CalendarHeaderModuleCssNamespace.ICalendarHeaderModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CalendarHeaderModuleCssNamespace.ICalendarHeaderModuleCss;
};

export = CalendarHeaderModuleCssModule;
