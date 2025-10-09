import { DiContainer } from "@/container/core";
import { 
    OddsFeedEventSourceImpl,
    OddsFeedPullServiceImpl,
    OddsFeedSchedulerImpl,
    OddsFeedStoreImpl,
    EventCleanerServiceImpl,
    SchedulerImpl,
    OddsFeedServiceImpl,
    OddsFeedCronImpl,
    MarbleLoggerServiceImpl
 } from "@/services";
import { 
    EventCleanerService, 
    MarbleLoggerService, 
    OddsFeedCron, 
    OddsFeedStore,
} from "@/interfaces";
import { Event } from "@/domain";


function register<TEvent extends Event = Event>(diContainer: DiContainer, {
    oddsFeedFilter = true,
}: {
    oddsFeedFilter?: boolean | ((event: TEvent, index: number, array: TEvent[]) => boolean);
} = {
    oddsFeedFilter: true,
}) {
    const normalizedoddsFeedFilter: (event: TEvent, index: number, array: TEvent[]) => boolean =
        typeof oddsFeedFilter === "function"
            ? oddsFeedFilter
            : () => !!oddsFeedFilter;
    diContainer.register({
        registerType: "class",
        key: "marbleLoggerService",
        value: MarbleLoggerServiceImpl,
    })
    diContainer.register({
        registerType: "class",
        key: "oddsFeedEventSource",
        value: OddsFeedEventSourceImpl,
    })
    diContainer.register({
        registerType: "class",
        key: "oddsFeedPullService",
        value: OddsFeedPullServiceImpl,
    })
    diContainer.register({
        registerType: "class",
        key: "oddsFeedScheduler",
        value: OddsFeedSchedulerImpl,
    })
    diContainer.register({
        registerType: "class",
        key: "oddsFeedStore",
        value: OddsFeedStoreImpl,
        disposer: (oddsFeedStore) => oddsFeedStore.dispose(),
    })
    diContainer.register({
        registerType: "class",
        key: "eventCleanerService",
        value: EventCleanerServiceImpl,
        disposer: (eventCleanerService) => eventCleanerService.dispose(),
    })
    diContainer.register({
        registerType: "class",
        key: "scheduler",
        value: SchedulerImpl,
        disposer: (scheduler) => scheduler.dispose(),
    })
    diContainer.register({
        registerType: "class",
        key: "oddsFeedService",
        value: OddsFeedServiceImpl,
    })
    diContainer.register({
        registerType: "class",
        key: "oddsFeedCron",
        value: OddsFeedCronImpl,
    });
    diContainer.register({
        registerType: "value",
        key: "oddsFeedFilter",
        value: normalizedoddsFeedFilter,
    })
}

function init(container: DiContainer) {
    container.resolve<MarbleLoggerService>("marbleLoggerService").init({});
    container.resolve<OddsFeedStore>("oddsFeedStore").initEvent();
    container.resolve<EventCleanerService>("eventCleanerService").initEvent();
    container.resolve<OddsFeedCron>("oddsFeedCron").start();
}

export { register, init };