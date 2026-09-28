declare namespace ModalContentModuleCssNamespace {
  export interface IModalContentModuleCss {
    closeButton: string;
    modalContent: string;
  }
}

declare const ModalContentModuleCssModule: ModalContentModuleCssNamespace.IModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ModalContentModuleCssNamespace.IModalContentModuleCss;
};

export = ModalContentModuleCssModule;
