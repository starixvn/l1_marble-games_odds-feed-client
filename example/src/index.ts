import { asClass, asValue, createContainer, InjectionMode } from "awilix";
import { init, register } from "odds-feed-client/dependency-injection";
import { AwilixDIContainer } from "odds-feed-client/awilix";

import { appConfigs } from "./app-configs";
import { CustomLogger } from "./logger";
import { LogService } from "./log-service";

const container = createContainer();


container.register({
    appConfigs: asValue(appConfigs),
    logger: asClass(CustomLogger),
    logService: asClass(LogService).disposer(service => service.dispose()),
});

const diContainer = new AwilixDIContainer(container);

register(diContainer);
init(diContainer);

diContainer.resolve<LogService>("logService").init();
