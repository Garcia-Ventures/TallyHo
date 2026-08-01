/// <reference types="vite/client" />
/// <reference types="nativewind/types" />

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'use-sync-external-store/with-selector' {
  export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => Snapshot,
    getServerSnapshot: undefined | (() => Snapshot),
    selector: (snapshot: Snapshot) => Selection,
    isEqual?: (a: Selection, b: Selection) => boolean,
  ): Selection;
}

declare module 'use-sync-external-store/shim/with-selector' {
  export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => Snapshot,
    getServerSnapshot: undefined | (() => Snapshot),
    selector: (snapshot: Snapshot) => Selection,
    isEqual?: (a: Selection, b: Selection) => boolean,
  ): Selection;
}
