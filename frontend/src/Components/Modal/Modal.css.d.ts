declare namespace ModalCssNamespace {
  export interface IModalCss {
    extraExtraLarge: string;
    extraLarge: string;
    extraSmall: string;
    large: string;
    medium: string;
    modal: string;
    modalBackdrop: string;
    modalContainer: string;
    modalOpen: string;
    modalOpenIOS: string;
    small: string;
  }
}

declare const ModalCssModule: ModalCssNamespace.IModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ModalCssNamespace.IModalCss;
};

export = ModalCssModule;
