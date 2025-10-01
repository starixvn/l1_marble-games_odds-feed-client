import { aliasTo, asClass, asFunction, asValue, AwilixContainer } from "awilix";
import { Constructor, DiContainer } from "@/container/core";


export class AwilixDIContainer implements DiContainer {
    private container: AwilixContainer;
    constructor(container: AwilixContainer) {
        this.container = container;
    }

    public register<T>({
        registerType = "class",
        key = "default",
        value = undefined,
        disposer = undefined,
    }: {
        registerType: "class" | "function" | "value" | "alias",
        key: string | Symbol,
        value?: Constructor<T> | ((...args: any[]) => T) | Promise<T> | string,
        disposer?: (service: T) => void | Promise<void>,
    }): void {
        switch (registerType) {
            case "class":
                this.registerClass({
                    key: key as string,
                    type: value as Constructor<T>,
                    disposer,
                })
                break;
            case "function":
                this.registerFunction({
                    fn: value as (...args: any[]) => T,
                    key: key as string,
                })
                break;
            case "value":
                this.registerValue({
                    value,
                    key: key as string,
                })
                break;
            case "alias":
                this.registerAlias({
                    key: key as string,
                    alias: value as string,
                })
                break;
        }
    }

    private registerAlias<T>({
        key,
        alias,
    }: {
        key: string,
        alias: string,
    }): void {
        this.container.register({
            [key]: aliasTo(alias)
        })
    }

    private registerClass<T>({
        type,
        key,
        disposer,
    }: {
        type: Constructor<T>,
        key: string,
        disposer?: (service: T) => void | Promise<void>,
    }): void {
        this.container.register({
            [key]: asClass(type).singleton().disposer(disposer ?? (() => {}))
        })
    }

    private registerValue<T>({
        value,
        key,
    }: {
        value: T,
        key: string,
    }): void {
        this.container.register({
            [key]: asValue(value)
        })
    }

    private registerFunction<T>({
        fn,
        key,
    }: {
        fn: (...args: any[]) => T,
        key: string,
    }): void {
        this.container.register({
            [key]: asFunction(fn)
        })
    }

    public resolve<T>(key: string): T {
        return this.container.resolve(key);
    }
}
