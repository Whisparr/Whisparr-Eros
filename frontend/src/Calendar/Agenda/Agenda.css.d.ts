declare namespace AgendaCssNamespace {
  export interface IAgendaCss {
    agenda: string;
  }
}

declare const AgendaCssModule: AgendaCssNamespace.IAgendaCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AgendaCssNamespace.IAgendaCss;
};

export = AgendaCssModule;
