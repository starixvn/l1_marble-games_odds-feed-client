import { DiContainer } from "odds-feed-client/container";
import { appConfigs } from "./app-configs";
import { LogService } from "./log-service";
import { CustomLogger } from "./logger";

export function registerLogServices(diContainer: DiContainer) {
    diContainer.register({
        registerType: "class",
        key: "logService",
        value: LogService,
    });
    
    diContainer.register({
        registerType: "class",
        key: "logger",
        value: CustomLogger,
    });
    
    diContainer.register({
        registerType: "value",
        key: "appConfigs",
        value: appConfigs,
  });
}

export function initLogServices(diContainer: DiContainer) {
    diContainer.resolve<LogService>("logService").init();
}