declare namespace DescriptionListItemDescriptionCssNamespace {
  export interface IDescriptionListItemDescriptionCss {
    description: string;
  }
}

declare const DescriptionListItemDescriptionCssModule: DescriptionListItemDescriptionCssNamespace.IDescriptionListItemDescriptionCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DescriptionListItemDescriptionCssNamespace.IDescriptionListItemDescriptionCss;
};

export = DescriptionListItemDescriptionCssModule;
