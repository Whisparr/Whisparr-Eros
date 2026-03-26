declare namespace DescriptionListItemTitleCssNamespace {
  export interface IDescriptionListItemTitleCss {
    title: string;
  }
}

declare const DescriptionListItemTitleCssModule: DescriptionListItemTitleCssNamespace.IDescriptionListItemTitleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DescriptionListItemTitleCssNamespace.IDescriptionListItemTitleCss;
};

export = DescriptionListItemTitleCssModule;
