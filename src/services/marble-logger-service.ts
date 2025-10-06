import { captureException, captureMessage, init, setTag } from "@sentry/node";
import { idHelper } from "@/utils";
import { MarbleLoggerService, MarbleLoggerInitConfig, MarbleLogAnnotation } from "@/interfaces/marble-logger-service";

interface MarbleLoggerContainer {
    appConfigs: AppConfigs;
}

interface AppConfigs {
    sentry: 
    { 
        sentryUrl: string;
        logIdentifier: string;
        env: string;
        debug?: boolean;
    }
}


export class MarbleLoggerServiceImpl implements MarbleLoggerService {
    private _dsn = "";
    private _logIdentifier = "";
    private _env = "";
    private _debug = false;

    constructor(container: MarbleLoggerContainer) {

        this._dsn = container.appConfigs.sentry.sentryUrl;
        this._logIdentifier = container.appConfigs.sentry.logIdentifier;
        this._env = container.appConfigs.sentry.env;
        this._debug = container.appConfigs.sentry.debug ?? false;
    }

    init({
        sentryRelease = "",
        tracesSampleRate = 1.0,
        debug = false,
    }: MarbleLoggerInitConfig = {}) {
        init({
            dsn: this._dsn,
            environment: this._env,
            debug: this._debug,
            tracesSampleRate: tracesSampleRate,
            attachStacktrace: true,
            release: sentryRelease,
        });
        this._debug = debug;
    }

    public log(message: string, annotation?: MarbleLogAnnotation) {
        this.setTagByAnnotation(annotation);
        captureMessage(message, "log");
        this.developmentDebugLog(message, annotation);
    }

    public error(error: Error, annotation?: MarbleLogAnnotation) {
        this.setTagByAnnotation(annotation);

        captureException(error);
        this.developmentDebugLog(error.message, annotation);
    }

    public warning(message: string, annotation?: MarbleLogAnnotation) {
        this.setTagByAnnotation(annotation);
        captureMessage(message, "warning");
        this.developmentDebugLog(message, annotation);
    }

    public debug(message: string, annotation?: MarbleLogAnnotation) {
        if (!this._debug) {
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