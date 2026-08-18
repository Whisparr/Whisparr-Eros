import ModelBase from 'App/ModelBase';

export type LogEventLevel =
  'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEvent extends ModelBase {
  time: string;
  level: LogEventLevel;
  logger: string;
  message: string;
  exception?: string;
  exceptionType?: string;
  method?: string;
}

export default LogEvent;
