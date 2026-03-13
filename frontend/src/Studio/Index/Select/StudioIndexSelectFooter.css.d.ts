declare namespace StudioIndexSelectFooterCssNamespace {
  export interface IStudioIndexSelectFooterCss {
    actionButtons: string;
    buttons: string;
    deleteButtons: string;
    footer: string;
    selected: string;
  }
}

declare const StudioIndexSelectFooterCssModule: StudioIndexSelectFooterCssNamespace.IStudioIndexSelectFooterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioIndexSelectFooterCssNamespace.IStudioIndexSelectFooterCss;
};

export = StudioIndexSelectFooterCssModule;
