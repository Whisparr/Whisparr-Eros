declare namespace ScheduledTaskRowCssNamespace {
  export interface IScheduledTaskRowCss {
    actions: string;
    interval: string;
    lastDuration: string;
    lastExecution: string;
    nextExecution: string;
  }
}

declare const ScheduledTaskRowCssModule: ScheduledTaskRowCssNamespace.IScheduledTaskRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ScheduledTaskRowCssNamespace.IScheduledTaskRowCss;
};

export = ScheduledTaskRowCssModule;
