declare namespace DescriptionListItemTitleModuleCssNamespace {
  export interface IDescriptionListItemTitleModuleCss {
    title: string;
  }
}

declare const DescriptionListItemTitleModuleCssModule: DescriptionListItemTitleModuleCssNamespace.IDescriptionListItemTitleModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DescriptionListItemTitleModuleCssNamespace.IDescriptionListItemTitleModuleCss;
};

export = DescriptionListItemTitleModuleCssModule;
