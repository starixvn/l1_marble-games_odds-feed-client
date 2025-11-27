import { idHelper } from "@/utils";
import { MarbleLoggerService, MarbleLogAnnotation } from "@/interfaces/marble-logger-service";
import { Logger } from "@/interfaces";

interface MarbleLoggerContainer {
  appConfigs: AppConfigs;
  logService: Logger;
}

interface AppConfigs {
  debug?: boolean;
  sentry: {
    sentryUrl: string;
    logIdentifier: string;
    env: string;
    debug?: boolean;
  };
}

export class MarbleLoggerServiceImpl implements MarbleLoggerService {
  private readonly _debug: boolean = false;
  private readonly logService: Logger;
  constructor(container: MarbleLoggerContainer) {
    this._debug = container.appConfigs.sentry.debug ?? container.appConfigs.debug ?? false;
    this.logService = container.logService;
  }

  init() {
    return;
  }

  public log(message: string, annotation?: MarbleLogAnnotation) {
    this.developmentDebugLog(message, annotation);
  }

  public error(error: Error, annotation?: MarbleLogAnnotation) {
    this.developmentDebugLog(error.message, annotation);
    const gameId = annotation?.gameId ?? idHelper.extractGameId(annotation?.eventId ?? 0);
    this.logService.logError(`${gameId}: ${error.message}`);
  }

  public warning(message: string, annotation?: MarbleLogAnnotation) {
    this.developmentDebugLog(message, annotation);
    const gameId = annotation?.gameId ?? idHelper.extractGameId(annotation?.eventId ?? 0);
    this.logService.log(`${gameId}: ${message}`, "warning");
  }

  public debug(message: string, annotation?: MarbleLogAnnotation) {
    if (!this._debug) {
      return;
    }
    const gameId = annotation?.gameId ?? idHelper.extractGameId(annotation?.eventId ?? 0);
    this.logService.log(`${gameId}: ${message}`, "debug");

  }

  private developmentDebugLog(message: string, annotation?: MarbleLogAnnotation) {
    if (!this._debug) {
      return;
    }

    console.log(`\x1b[32m[MarbleLogger]\x1b[37m: ${message}`);
    console.log(`
            event id: ${annotation?.eventId}
            game id: ${annotation?.gameId ?? idHelper.extractGameId(annotation?.eventId ?? 0)}
        `);
    console.log(`message: ${message}`);
  }
}
