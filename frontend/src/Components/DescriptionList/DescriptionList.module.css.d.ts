declare namespace DescriptionListModuleCssNamespace {
  export interface IDescriptionListModuleCss {
    descriptionList: string;
  }
}

declare const DescriptionListModuleCssModule: DescriptionListModuleCssNamespace.IDescriptionListModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DescriptionListModuleCssNamespace.IDescriptionListModuleCss;
};

export = DescriptionListModuleCssModule;
