declare namespace EditPerformersModalContentCssNamespace {
  export interface IEditPerformersModalContentCss {
    modalFooter: string;
    selected: string;
  }
}

declare const EditPerformersModalContentCssModule: EditPerformersModalContentCssNamespace.IEditPerformersModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditPerformersModalContentCssNamespace.IEditPerformersModalContentCss;
};

export = EditPerformersModalContentCssModule;
