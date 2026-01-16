// Type declarations for modules without TypeScript definitions

declare module 'react-window-infinite-loader' {
  import { Component, ReactNode } from 'react'

  interface InfiniteLoaderProps {
    isItemLoaded: (index: number) => boolean
    itemCount: number
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void> | void
    minimumBatchSize?: number
    threshold?: number
    children: (props: {
      onItemsRendered: (props: {
        overscanStartIndex: number
        overscanStopIndex: number
        visibleStartIndex: number
        visibleStopIndex: number
      }) => void
      ref: (ref: any) => void
    }) => ReactNode
  }

  class InfiniteLoader extends Component<InfiniteLoaderProps> {
    resetloadMoreItemsCache(autoReload?: boolean): void
  }

  export default InfiniteLoader
}

declare module 'lodash.debounce' {
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: {
      leading?: boolean
      maxWait?: number
      trailing?: boolean
    }
  ): T & { cancel(): void; flush(): void }

  export default debounce
}
