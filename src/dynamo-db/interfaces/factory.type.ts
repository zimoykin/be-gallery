export type Factory<T> = () => new (...args: any[]) => T;


export const factoryConstructor = <T>(cls: new (...args: any[]) => T): Factory<T> => {
    return () => cls;
};