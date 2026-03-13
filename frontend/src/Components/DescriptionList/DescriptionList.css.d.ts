declare namespace DescriptionListCssNamespace {
  export interface IDescriptionListCss {
    descriptionList: string;
  }
}

declare const DescriptionListCssModule: DescriptionListCssNamespace.IDescriptionListCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DescriptionListCssNamespace.IDescriptionListCss;
};

export = DescriptionListCssModule;
