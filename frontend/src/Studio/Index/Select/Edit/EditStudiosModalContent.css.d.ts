declare namespace EditStudiosModalContentCssNamespace {
  export interface IEditStudiosModalContentCss {
    modalFooter: string;
    selected: string;
  }
}

declare const EditStudiosModalContentCssModule: EditStudiosModalContentCssNamespace.IEditStudiosModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditStudiosModalContentCssNamespace.IEditStudiosModalContentCss;
};

export = EditStudiosModalContentCssModule;
