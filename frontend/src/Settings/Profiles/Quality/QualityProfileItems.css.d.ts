declare namespace QualityProfileItemsCssNamespace {
  export interface IQualityProfileItemsCss {
    editGroupsButton: string;
    editGroupsButtonIcon: string;
    qualities: string;
  }
}

declare const QualityProfileItemsCssModule: QualityProfileItemsCssNamespace.IQualityProfileItemsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileItemsCssNamespace.IQualityProfileItemsCss;
};

export = QualityProfileItemsCssModule;
