declare namespace PerformerIndexSelectFooterCssNamespace {
  export interface IPerformerIndexSelectFooterCss {
    actionButtons: string;
    buttons: string;
    deleteButtons: string;
    footer: string;
    selected: string;
  }
}

declare const PerformerIndexSelectFooterCssModule: PerformerIndexSelectFooterCssNamespace.IPerformerIndexSelectFooterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerIndexSelectFooterCssNamespace.IPerformerIndexSelectFooterCss;
};

export = PerformerIndexSelectFooterCssModule;
