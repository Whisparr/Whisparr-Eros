declare namespace DateInputCssNamespace {
  export interface IDateInputCss {
    dateInput: string;
    input: string;
  }
}

declare const DateInputCssModule: DateInputCssNamespace.IDateInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DateInputCssNamespace.IDateInputCss;
};

export = DateInputCssModule;
