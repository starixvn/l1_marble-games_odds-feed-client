import { captureException, captureMessage, init, setTag } from "@sentry/node";
import { idHelper } from "@/utils";
import { MarbleLoggerService, MarbleLoggerInitConfig, MarbleLogAnnotation } from "@/interfaces/marble-logger-service";

interface MarbleLoggerContainer {
  appConfigs: AppConfigs;
  debug?: boolean;
}

interface AppConfigs {
  sentry: {
    sentryUrl: string;
    logIdentifier: string;
    env: string;
    debug?: boolean;
  };
}

export class MarbleLoggerServiceImpl implements MarbleLoggerService {
  private readonly _dsn: string = "";
  private readonly _logIdentifier: string = "";
  private readonly _env: string = "";
  private readonly _debug: boolean = false;
  private readonly _sentry: boolean = false;

  constructor(container: MarbleLoggerContainer) {
    this._sentry = !!container.appConfigs.sentry;
    if (!this._sentry) {
      return;
    }
    this._dsn = container.appConfigs.sentry.sentryUrl;
    this._logIdentifier = container.appConfigs.sentry.logIdentifier;
    this._env = container.appConfigs.sentry.env;
    this._debug = container.appConfigs.sentry.debug ?? container.debug ?? false;
  }

  init({ sentryRelease = "", tracesSampleRate = 1 }: MarbleLoggerInitConfig = {}) {
    if (!this._sentry) {
      return;
    }
    init({
      dsn: this._dsn,
      environment: this._env,
      debug: this._debug,
      tracesSampleRate: tracesSampleRate,
      attachStacktrace: true,
      release: sentryRelease,
    });
  }

  public log(message: string, annotation?: MarbleLogAnnotation) {
    this.developmentDebugLog(message, annotation);
    if (!this._sentry) {
      return;
    }
    this.setTagByAnnotation(annotation);
    captureMessage(message, "log");
  }

  public error(error: Error, annotation?: MarbleLogAnnotation) {
    this.developmentDebugLog(error.message, annotation);
    if (!this._sentry) {
      return;
    }
    this.setTagByAnnotation(annotation);

    captureException(error);
  }

  public warning(message: string, annotation?: MarbleLogAnnotation) {
    this.developmentDebugLog(message, annotation);
    if (!this._sentry) {
      return;
    }
    this.setTagByAnnotation(annotation);
    captureMessage(message, "warning");
  }

  public debug(message: string, annotation?: MarbleLogAnnotation) {
    if (!this._debug || !this._sentry) {
      return;
    }

    this.setTagByAnnotation(annotation);
    captureMessage(message, "debug");
  }

  private setTagByAnnotation(annotation?: MarbleLogAnnotation) {
    const gameId = annotation?.gameId ?? idHelper.extractGameId(annotation?.eventId ?? 0);
    const identifier = `[${gameId}][${this._logIdentifier}]`;

    setTag("gameId", gameId);
    setTag("logIdentifier", identifier);
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
