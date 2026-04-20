export interface Panel {
  id: string
  panel: {
    dialogue: { text: string }[]
    action: any[]
    emotion: any
    visual: any
    camera: any
  }
}

export interface Page {
  id: string
  panels: Panel[]
}

export interface Chapter {
  id: string
  title: string
  pages: Page[]
}

export interface HistoryEntry<T> {
  state: T
  actionType: string
  timestamp: number
}

export interface HistoryState<T> {
  past: HistoryEntry<T>[]
  present: T
  future: HistoryEntry<T>[]
}