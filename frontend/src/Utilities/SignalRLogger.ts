import * as signalR from '@microsoft/signalr';

class SignalRLogger {
  minimumLogLevel: signalR.LogLevel;

  constructor(minimumLogLevel: signalR.LogLevel) {
    this.minimumLogLevel = minimumLogLevel;
  }

  cleanse(message: string) {
    const apikey = new RegExp(
      `access_token=${encodeURIComponent(window.Whisparr.apiKey)}`,
      'g'
    );

    return message.replace(apikey, 'access_token=(removed)');
  }

  log(logLevel: signalR.LogLevel, message: string) {
    // see https://github.com/aspnet/AspNetCore/blob/21c9e2cc954c10719878839cd3f766aca5f57b34/src/SignalR/clients/ts/signalr/src/Utils.ts#L147
    if (logLevel < this.minimumLogLevel) {
      return;
    }

    switch (logLevel) {
      case signalR.LogLevel.Critical:
      case signalR.LogLevel.Error:
        console.error(
          `[signalR] ${signalR.LogLevel[logLevel]}: ${this.cleanse(message)}`
        );
        break;
      case signalR.LogLevel.Warning:
        console.warn(
          `[signalR] ${signalR.LogLevel[logLevel]}: ${this.cleanse(message)}`
        );
        break;
      case signalR.LogLevel.Information:
        console.info(
          `[signalR] ${signalR.LogLevel[logLevel]}: ${this.cleanse(message)}`
        );
        break;
      default:
        // console.debug only goes to attached debuggers in Node, so we use
        // console.log for Trace and Debug
        console.log(
          `[signalR] ${signalR.LogLevel[logLevel]}: ${this.cleanse(message)}`
        );
        break;
    }
  }
}

export default SignalRLogger;
