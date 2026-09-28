declare namespace ModalFooterModuleCssNamespace {
  export interface IModalFooterModuleCss {
    modalFooter: string;
  }
}

declare const ModalFooterModuleCssModule: ModalFooterModuleCssNamespace.IModalFooterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ModalFooterModuleCssNamespace.IModalFooterModuleCss;
};

export = ModalFooterModuleCssModule;
