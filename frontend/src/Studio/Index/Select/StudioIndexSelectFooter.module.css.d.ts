declare namespace StudioIndexSelectFooterModuleCssNamespace {
  export interface IStudioIndexSelectFooterModuleCss {
    actionButtons: string;
    buttons: string;
    deleteButtons: string;
    footer: string;
    selected: string;
  }
}

declare const StudioIndexSelectFooterModuleCssModule: StudioIndexSelectFooterModuleCssNamespace.IStudioIndexSelectFooterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioIndexSelectFooterModuleCssNamespace.IStudioIndexSelectFooterModuleCss;
};

export = StudioIndexSelectFooterModuleCssModule;
