declare namespace EditQualityProfileModalContentCssNamespace {
  export interface IEditQualityProfileModalContentCss {
    deleteButtonContainer: string;
    formGroupWrapper: string;
    formGroupsContainer: string;
    formatItemLarge: string;
    formatItemSmall: string;
  }
}

declare const EditQualityProfileModalContentCssModule: EditQualityProfileModalContentCssNamespace.IEditQualityProfileModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditQualityProfileModalContentCssNamespace.IEditQualityProfileModalContentCss;
};

export = EditQualityProfileModalContentCssModule;
