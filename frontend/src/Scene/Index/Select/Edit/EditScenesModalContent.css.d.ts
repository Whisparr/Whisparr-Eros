declare namespace EditScenesModalContentCssNamespace {
  export interface IEditScenesModalContentCss {
    modalFooter: string;
    selected: string;
  }
}

declare const EditScenesModalContentCssModule: EditScenesModalContentCssNamespace.IEditScenesModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditScenesModalContentCssNamespace.IEditScenesModalContentCss;
};

export = EditScenesModalContentCssModule;
