export type Constructor<T> = {
  new (...args: any[]): T;
};

export interface DiContainer {
  register<T = any>({
    registerType,
    key,
    value,
    disposer,
  }: {
    registerType: "class" | "function" | "value" | "alias";
    key: string | Symbol;
    value?: Constructor<T> | ((...args: any[]) => T) | Promise<T> | string | T;
    disposer?: (service: T) => void | Promise<void>;
  }): void;

  resolve<T>(key: string): T;
}
