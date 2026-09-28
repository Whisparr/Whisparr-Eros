declare namespace DescriptionListItemDescriptionModuleCssNamespace {
  export interface IDescriptionListItemDescriptionModuleCss {
    description: string;
  }
}

declare const DescriptionListItemDescriptionModuleCssModule: DescriptionListItemDescriptionModuleCssNamespace.IDescriptionListItemDescriptionModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DescriptionListItemDescriptionModuleCssNamespace.IDescriptionListItemDescriptionModuleCss;
};

export = DescriptionListItemDescriptionModuleCssModule;
