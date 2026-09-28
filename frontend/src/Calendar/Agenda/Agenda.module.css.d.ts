declare namespace AgendaModuleCssNamespace {
  export interface IAgendaModuleCss {
    agenda: string;
  }
}

declare const AgendaModuleCssModule: AgendaModuleCssNamespace.IAgendaModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AgendaModuleCssNamespace.IAgendaModuleCss;
};

export = AgendaModuleCssModule;
