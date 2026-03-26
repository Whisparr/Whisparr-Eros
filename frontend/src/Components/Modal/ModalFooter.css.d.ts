declare namespace ModalFooterCssNamespace {
  export interface IModalFooterCss {
    modalFooter: string;
  }
}

declare const ModalFooterCssModule: ModalFooterCssNamespace.IModalFooterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ModalFooterCssNamespace.IModalFooterCss;
};

export = ModalFooterCssModule;
