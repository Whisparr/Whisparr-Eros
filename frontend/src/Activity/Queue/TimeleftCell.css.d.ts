declare namespace TimeleftCellCssNamespace {
  export interface ITimeleftCellCss {
    timeleft: string;
  }
}

declare const TimeleftCellCssModule: TimeleftCellCssNamespace.ITimeleftCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TimeleftCellCssNamespace.ITimeleftCellCss;
};

export = TimeleftCellCssModule;
