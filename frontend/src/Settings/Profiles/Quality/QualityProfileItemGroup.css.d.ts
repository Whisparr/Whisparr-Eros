declare namespace QualityProfileItemGroupCssNamespace {
  export interface IQualityProfileItemGroupCss {
    checkInput: string;
    checkInputContainer: string;
    deleteGroupButton: string;
    dragHandle: string;
    dragIcon: string;
    editGroups: string;
    groupQualities: string;
    isDragging: string;
    items: string;
    name: string;
    nameContainer: string;
    nameInput: string;
    notAllowed: string;
    qualityNameContainer: string;
    qualityNameLabel: string;
    qualityProfileItemGroup: string;
    qualityProfileItemGroupInfo: string;
  }
}

declare const QualityProfileItemGroupCssModule: QualityProfileItemGroupCssNamespace.IQualityProfileItemGroupCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileItemGroupCssNamespace.IQualityProfileItemGroupCss;
};

export = QualityProfileItemGroupCssModule;
