declare namespace DateInputModuleCssNamespace {
  export interface IDateInputModuleCss {
    dateInput: string;
    input: string;
  }
}

declare const DateInputModuleCssModule: DateInputModuleCssNamespace.IDateInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DateInputModuleCssNamespace.IDateInputModuleCss;
};

export = DateInputModuleCssModule;
