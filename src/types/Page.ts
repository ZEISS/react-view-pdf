export enum PageViewMode {
  DEFAULT,
  FIT_TO_WIDTH,
  FIT_TO_HEIGHT,
}

export interface PageType {
  ref: HTMLDivElement | null;
  ratio: number;
  loaded: boolean;
  width?: number;
  height?: number;
}
