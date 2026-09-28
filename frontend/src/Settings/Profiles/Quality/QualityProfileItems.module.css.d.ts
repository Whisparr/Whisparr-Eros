declare namespace QualityProfileItemsModuleCssNamespace {
  export interface IQualityProfileItemsModuleCss {
    editGroupsButton: string;
    editGroupsButtonIcon: string;
    qualities: string;
  }
}

declare const QualityProfileItemsModuleCssModule: QualityProfileItemsModuleCssNamespace.IQualityProfileItemsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileItemsModuleCssNamespace.IQualityProfileItemsModuleCss;
};

export = QualityProfileItemsModuleCssModule;
