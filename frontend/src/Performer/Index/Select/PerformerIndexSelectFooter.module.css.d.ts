declare namespace PerformerIndexSelectFooterModuleCssNamespace {
  export interface IPerformerIndexSelectFooterModuleCss {
    actionButtons: string;
    buttons: string;
    deleteButtons: string;
    footer: string;
    selected: string;
  }
}

declare const PerformerIndexSelectFooterModuleCssModule: PerformerIndexSelectFooterModuleCssNamespace.IPerformerIndexSelectFooterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerIndexSelectFooterModuleCssNamespace.IPerformerIndexSelectFooterModuleCss;
};

export = PerformerIndexSelectFooterModuleCssModule;
