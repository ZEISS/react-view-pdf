import { PDFRenderTask } from 'pdfjs-dist';

export interface PageType {
  ref: HTMLDivElement | null;
  loaded: boolean;
  rendered: boolean;
  width?: number;
  height?: number;
  landscape: boolean;
}

export enum PageViewMode {
  DEFAULT,
  FIT_TO_WIDTH,
  FIT_TO_HEIGHT,
}

export interface InternalRenderTask {
  running: boolean;
  cancelled: boolean;
  pageNumber: number;
  graphicsReady: boolean;
}

export interface ExtendedPDFRenderTask extends PDFRenderTask {
  _internalRenderTask: InternalRenderTask;
}
