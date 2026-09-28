declare namespace QualityProfileItemModuleCssNamespace {
  export interface IQualityProfileItemModuleCss {
    checkInput: string;
    checkInputContainer: string;
    createGroupButton: string;
    dragHandle: string;
    dragIcon: string;
    isDragging: string;
    isInGroup: string;
    notAllowed: string;
    qualityName: string;
    qualityNameContainer: string;
    qualityProfileItem: string;
  }
}

declare const QualityProfileItemModuleCssModule: QualityProfileItemModuleCssNamespace.IQualityProfileItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileItemModuleCssNamespace.IQualityProfileItemModuleCss;
};

export = QualityProfileItemModuleCssModule;
