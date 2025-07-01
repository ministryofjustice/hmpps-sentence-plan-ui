declare module 'cypress-image-diff-js' {
  export function getCompareSnapshotsPlugin(on: any, config: any): void;
  export function addCompareSnapshotCommand(options?: Record<string, any>): void;
}
