import { DiContainer } from "odds-feed-client/container";
import { appConfigs } from "./app-configs";
import { EventConsoleLogger } from "./event-console-logger";
import { LogService } from "./log-service";

export function registerLogServices(diContainer: DiContainer) {
  diContainer.register({
    registerType: "class",
    key: "logService",
    value: LogService,
  });

  diContainer.register({
    registerType: "class",
    key: "eventConsoleLogger",
    value: EventConsoleLogger,
  });

  diContainer.register({
    registerType: "value",
    key: "appConfigs",
    value: appConfigs,
  });

  diContainer.register({
    registerType: "value",
    key: "shouldValidateEventScheduleStart",
    value: false
  });
}

export function initLogServices(diContainer: DiContainer) {
  diContainer.resolve<EventConsoleLogger>("eventConsoleLogger").init();
}
