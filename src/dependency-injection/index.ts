import { DiContainer } from "@/container/core";
import { 
    OddFeedEventSourceImpl,
    OddFeedPullServiceImpl,
    OddFeedSchedulerImpl,
    OddFeedStoreImpl,
    EventCleanerServiceImpl,
    SchedulerImpl,
    OddFeedServiceImpl,
    OddFeedCronImpl,
 } from "@/services";
import { 
    EventCleanerService, 
    OddFeedCron, 
    OddFeedStore,
} from "@/interfaces";
import { Event } from "@/domain";


function register<TEvent extends Event = Event>(diContainer: DiContainer, {
    oddFeedFilter = true,
}: {
    oddFeedFilter?: boolean | ((event: TEvent, index: number, array: TEvent[]) => boolean);
} = {
    oddFeedFilter: true,
}) {
    const normalizedOddFeedFilter: (event: TEvent, index: number, array: TEvent[]) => boolean =
        typeof oddFeedFilter === "function"
            ? oddFeedFilter
            : () => !!oddFeedFilter;
    diContainer.register({
        registerType: "class",
        key: "oddFeedEventSource",
        value: OddFeedEventSourceImpl,
    })
    diContainer.register({
        registerType: "class",
        key: "oddFeedPullService",
        value: OddFeedPullServiceImpl,
    })
    diContainer.register({
        registerType: "class",
        key: "oddFeedScheduler",
        value: OddFeedSchedulerImpl,
    })
    diContainer.register({
        registerType: "class",
        key: "oddFeedStore",
        value: OddFeedStoreImpl,
        disposer: (oddFeedStore) => oddFeedStore.dispose(),
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
        key: "oddFeedService",
        value: OddFeedServiceImpl,
    })
    diContainer.register({
        registerType: "class",
        key: "oddFeedCron",
        value: OddFeedCronImpl,
    });
    diContainer.register({
        registerType: "value",
        key: "oddFeedFilter",
        value: normalizedOddFeedFilter,
    })
}

function init(container: DiContainer) {
    container.resolve<OddFeedStore>("oddFeedStore").initEvent();
    container.resolve<EventCleanerService>("eventCleanerService").initEvent();
    container.resolve<OddFeedCron>("oddFeedCron").start();
}

export { register, init };