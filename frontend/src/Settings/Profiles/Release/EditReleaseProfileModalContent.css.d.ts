declare namespace EditReleaseProfileModalContentCssNamespace {
  export interface IEditReleaseProfileModalContentCss {
    deleteButton: string;
    tagInternalInput: string;
  }
}

declare const EditReleaseProfileModalContentCssModule: EditReleaseProfileModalContentCssNamespace.IEditReleaseProfileModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditReleaseProfileModalContentCssNamespace.IEditReleaseProfileModalContentCss;
};

export = EditReleaseProfileModalContentCssModule;
