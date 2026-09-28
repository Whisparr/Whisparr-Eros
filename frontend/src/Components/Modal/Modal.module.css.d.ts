declare namespace ModalModuleCssNamespace {
  export interface IModalModuleCss {
    extraExtraLarge: string;
    extraLarge: string;
    extraSmall: string;
    large: string;
    medium: string;
    modal: string;
    modalBackdrop: string;
    modalContainer: string;
    modalOpen: string;
    small: string;
  }
}

declare const ModalModuleCssModule: ModalModuleCssNamespace.IModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ModalModuleCssNamespace.IModalModuleCss;
};

export = ModalModuleCssModule;
