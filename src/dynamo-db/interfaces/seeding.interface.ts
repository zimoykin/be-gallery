export interface Seeding<T = unknown> {
  seeding: () => Promise<T>;
}
