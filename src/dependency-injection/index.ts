import { DiContainer } from "@/container/core";
import {
  OddsFeedEventSourceImpl,
  OddsFeedPullServiceImpl,
  OddsFeedSchedulerImpl,
  EventCleanerServiceImpl,
  SchedulerImpl,
  OddsFeedServiceImpl,
  OddsFeedCronImpl,
  MarbleLoggerServiceImpl,
} from "@/services";
import { EventCleanerService, MarbleLoggerService, OddsFeedCron } from "@/interfaces";
import { Event } from "@/domain";
import { ApiLogger } from "../services/api-logger";
import { OddsFeedStore } from "../services/odds-feed-store";

const defaultOptions = {
  oddsFeedFilter: true,
  eventQueueMaxLength: 10,
  shouldValidateOdds: true,  
  logApiToFile: false,
}

function register<TEvent extends Event = Event>(
  diContainer: DiContainer,
  {
    oddsFeedFilter = true,
    eventQueueMaxLength = 10,
    shouldValidateOdds = true,
    logApiToFile = false,
  }: {
    oddsFeedFilter?: boolean | ((event: TEvent, index: number, array: TEvent[]) => boolean);
    eventQueueMaxLength?: number;
    shouldValidateOdds?: boolean;
    logApiToFile?: boolean;
  } = defaultOptions) {
  const normalizedoddsFeedFilter: (event: TEvent, index: number, array: TEvent[]) => boolean =
    typeof oddsFeedFilter === "function" ? oddsFeedFilter : () => !!oddsFeedFilter;
  diContainer.register({
    registerType: "class",
    key: "marbleLoggerService",
    value: MarbleLoggerServiceImpl,
  });
  diContainer.register({
    registerType: "class",
    key: "oddsFeedEventSource",
    value: OddsFeedEventSourceImpl,
  });
  diContainer.register({
    registerType: "class",
    key: "oddsFeedPullService",
    value: OddsFeedPullServiceImpl,
  });
  diContainer.register({
    registerType: "class",
    key: "oddsFeedScheduler",
    value: OddsFeedSchedulerImpl,
  });
  diContainer.register({
    registerType: "class",
    key: "eventCleanerService",
    value: EventCleanerServiceImpl,
    disposer: (eventCleanerService) => eventCleanerService.dispose(),
  });
  diContainer.register({
    registerType: "class",
    key: "scheduler",
    value: SchedulerImpl,
    disposer: (scheduler) => scheduler.dispose(),
  });
  diContainer.register({
    registerType: "class",
    key: "oddsFeedService",
    value: OddsFeedServiceImpl,
  });
  diContainer.register({
    registerType: "class",
    key: "oddsFeedCron",
    value: OddsFeedCronImpl,
  });
  diContainer.register({
    registerType: "value",
    key: "oddsFeedFilter",
    value: normalizedoddsFeedFilter,
  });
  diContainer.register({
    registerType: "value",
    key: "eventQueueMaxLength",
    value: eventQueueMaxLength,
  });
  diContainer.register({
    registerType: "value",
    key: "shouldValidateOdds",
    value: shouldValidateOdds,
  });
  diContainer.register({
    registerType: "value",
    key: "logApiToFile",
    value: logApiToFile,
  });

  diContainer.register({
    registerType: "class",
    key: "apiLogger",
    value: ApiLogger,
  });
  diContainer.register({
    registerType: "class",
    key: "oddsFeedStore",
    value: OddsFeedStore,
  });
}

const defaultInitOptions = {
  startCurrentEvents: false
}

function init(container: DiContainer, {
  startCurrentEvents = false,

}: {
  startCurrentEvents?: boolean;
} = defaultInitOptions) {
  container.resolve<MarbleLoggerService>("marbleLoggerService").init({});
  container.resolve<EventCleanerService>("eventCleanerService").initEvent();
  container.resolve<OddsFeedCron>("oddsFeedCron").start(startCurrentEvents);
}

export { register, init };
