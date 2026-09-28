declare namespace InteractiveImportRowModuleCssNamespace {
  export interface IInteractiveImportRowModuleCss {
    customFormatTooltip: string;
    label: string;
    languages: string;
    quality: string;
    relativePath: string;
    reprocessing: string;
  }
}

declare const InteractiveImportRowModuleCssModule: InteractiveImportRowModuleCssNamespace.IInteractiveImportRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: InteractiveImportRowModuleCssNamespace.IInteractiveImportRowModuleCss;
};

export = InteractiveImportRowModuleCssModule;
