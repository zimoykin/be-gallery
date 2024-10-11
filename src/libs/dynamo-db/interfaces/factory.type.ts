// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Factory<T> = () => new (...args: any[]) => T;

export const factoryConstructor = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cls: new (...args: any[]) => T,
): Factory<T> => {
  return () => cls;
};
