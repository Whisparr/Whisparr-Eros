declare namespace ScheduledTaskRowModuleCssNamespace {
  export interface IScheduledTaskRowModuleCss {
    actions: string;
    interval: string;
    lastDuration: string;
    lastExecution: string;
    nextExecution: string;
  }
}

declare const ScheduledTaskRowModuleCssModule: ScheduledTaskRowModuleCssNamespace.IScheduledTaskRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ScheduledTaskRowModuleCssNamespace.IScheduledTaskRowModuleCss;
};

export = ScheduledTaskRowModuleCssModule;
