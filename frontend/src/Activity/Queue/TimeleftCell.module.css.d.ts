declare namespace TimeleftCellModuleCssNamespace {
  export interface ITimeleftCellModuleCss {
    timeleft: string;
  }
}

declare const TimeleftCellModuleCssModule: TimeleftCellModuleCssNamespace.ITimeleftCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TimeleftCellModuleCssNamespace.ITimeleftCellModuleCss;
};

export = TimeleftCellModuleCssModule;
