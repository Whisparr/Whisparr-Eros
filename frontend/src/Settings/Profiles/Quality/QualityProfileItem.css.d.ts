declare namespace QualityProfileItemCssNamespace {
  export interface IQualityProfileItemCss {
    checkInput: string;
    checkInputContainer: string;
    createGroupButton: string;
    dragHandle: string;
    dragIcon: string;
    isDragging: string;
    isInGroup: string;
    isPreview: string;
    notAllowed: string;
    qualityName: string;
    qualityNameContainer: string;
    qualityProfileItem: string;
  }
}

declare const QualityProfileItemCssModule: QualityProfileItemCssNamespace.IQualityProfileItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileItemCssNamespace.IQualityProfileItemCss;
};

export = QualityProfileItemCssModule;
