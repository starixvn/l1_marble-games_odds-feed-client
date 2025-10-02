import { asClass, asValue, createContainer, InjectionMode } from "awilix";
import { init, register } from "odd-feed-client/dependency-injection";
import { AwilixDIContainer } from "odd-feed-client/awilix";

import { appConfigs } from "./app-configs";
import { CustomLogger } from "./logger";
import { LogService } from "./log-service";

const container = createContainer({
    injectionMode: InjectionMode.PROXY
});


container.register({
    appConfigs: asValue(appConfigs),
    logger: asClass(CustomLogger),
    logService: asClass(LogService).disposer(service => service.dispose()),
});

const diContainer = new AwilixDIContainer(container);

register(diContainer);
init(diContainer);

diContainer.resolve<LogService>("logService").init();
