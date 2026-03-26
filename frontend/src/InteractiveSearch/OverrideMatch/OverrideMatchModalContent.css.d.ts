declare namespace OverrideMatchModalContentCssNamespace {
  export interface IOverrideMatchModalContentCss {
    buttons: string;
    error: string;
    footer: string;
    item: string;
    label: string;
  }
}

declare const OverrideMatchModalContentCssModule: OverrideMatchModalContentCssNamespace.IOverrideMatchModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OverrideMatchModalContentCssNamespace.IOverrideMatchModalContentCss;
};

export = OverrideMatchModalContentCssModule;
