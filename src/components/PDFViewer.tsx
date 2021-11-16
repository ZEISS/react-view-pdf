import * as React from 'react';
import { debounce, distance, styled, themed, StandardProps } from 'precise-ui';
import PdfJs from '../utils/PdfJs';
import { PageViewMode, PageType } from '../types/Page';
import { PDFViewerPage } from './PDFViewerPage';
import { dataURItoUint8Array, isDataURI } from '../utils/hacks';
import { PDFViewerToolbar, ToolbarLabelProps } from './PDFViewerToolbar';
import { PDFViewerTouchToolbar } from './PDFViewerTouchToolbar';
import { PDFWorker } from './PDFWorker';

interface FullscreenableElement {
  fullscreen: boolean;
}

const DocumentWrapper = styled.div`
  background-color: #fff;
  position: relative;
  width: 100%;
  // Thanks chrome for Android for not calculating the viewport size correctly depending
  // on whether you show or not the address bar. But no worries, we'll do it manually
  // We also set 2 times the padding-top for those browsers without var or min compatibility
  padding-top: 56.25%;
  padding-top: min(56.25%, calc(var(--vh, 1vh) * 90)); /* 16:9 Aspect Ratio */
  overflow: hidden;

  ${({ fullscreen }: FullscreenableElement) =>
    fullscreen &&
    `
      padding-top: 0;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      height: auto;
      position: fixed;
      z-index: 100500;
    `};
`;

const Document = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 40px;
  right: 0;
  background-color: ${themed(({ theme = {} }: StandardProps) => theme.ui2)};
  padding: ${distance.medium};
  overflow: scroll;
  touch-action: pan-x pan-y;
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

export interface PDFViewerProps {
  /**
   * URL to the file to be loaded
   */
  url?: string;

  /**
   * Service workser URL
   */
  workerUrl?: string;

  /**
   * Function event triggered when a document fully loads successfully
   *
   * @param document
   */
  onLoadSuccess?(document: PdfJs.PdfDocument): void;

  /**
   * Function event triggered when a document fails to load
   *
   * @param error
   */
  onLoadError?(error: unknown): void;

  /**
   * Function event triggered when the current page changes
   *
   * @param currentPage
   * @param totalPages
   */
  onPageChanged?(currentPage: number, totalPages: number): void;

  /**
   * Optional object containing all labels used in the toolbar, in case localization is needed.
   */
  toolbarLabels?: ToolbarLabelProps;

  /**
   * Disable text selection for rendered pages
   */
  disableSelect?: boolean;
}

// const defaultWorkerUrl = 'https://unpkg.com/pdfjs-dist@2.4.456/build/pdf.worker.min.js';
const defaultWorkerUrl = 'https://unpkg.com/pdfjs-dist@2.4.456/es5/build/pdf.worker.js';
/**
 * The `Document` is a wrapper to load PDFs and render all the pages
 */
export const PDFViewer: React.FC<PDFViewerProps> = props => {
  const { url, workerUrl = defaultWorkerUrl } = props;
  const documentRef = React.useRef<HTMLDivElement>();
  const [document, setDocument] = React.useState<PdfJs.PdfDocument>();
  const [loading, setLoading] = React.useState(true);
  const [pages, setPages] = React.useState<Array<PageType>>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentViewMode, setCurrentViewMode] = React.useState<PageViewMode>(PageViewMode.DEFAULT);
  const [currentScale, setCurrentScale] = React.useState(1);
  const [fullscreen, setFullscreen] = React.useState(false);

  const deviceAgent = navigator.userAgent.toLowerCase();

  const isTouchDevice =
    deviceAgent.match(/(iphone|ipod|ipad)/) ||
    deviceAgent.match(/(android)/) ||
    deviceAgent.match(/(iemobile)/) ||
    deviceAgent.match(/iphone/i) ||
    deviceAgent.match(/ipad/i) ||
    deviceAgent.match(/ipod/i) ||
    deviceAgent.match(/blackberry/i) ||
    deviceAgent.match(/bada/i) ||
    (deviceAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2); // iPad PRO, apple thinks it should behave like a desktop Safari, and so here we are...

  /**
   * Every time a new file is set we load the new document
   */
  React.useEffect(() => {
    loadDocument();
  }, [url]);

  /**
   * Effect to re-calculate page size and re-render after entering / exiting fullscreen
   */
  React.useEffect(() => {
    zoomToPageView(pages[currentPage - 1], currentViewMode);
  }, [fullscreen]);

  /**
   * Effect responsible for registering/unregistering the resize spy to determine the rendering sizes
   */
  React.useLayoutEffect(() => {
    const handleResize = debounce(() => {
      zoomToPageView(pages[currentPage - 1], currentViewMode);

      // Fix chrome on Android address bar issue by setting the right viewport height with good old fashion JS
      // Then we set the value in the --vh custom property to the root of the document
      const vh = window.innerHeight * 0.01;
      window.document.documentElement.style.setProperty('--vh', `${vh}px`);
    }, 500);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  });

  React.useEffect(() => {
    props.onPageChanged && props.onPageChanged(currentPage, pages.length);
  }, [currentPage]);

  /**
   * Finds a document source.
   */
  async function findDocumentSource(url: string) {
    if (isDataURI(url)) {
      const fileUint8Array = dataURItoUint8Array(url);
      return { data: fileUint8Array };
    }

    return { url };
  }

  /**
   * Loads the PDF into the pdfjs library
   */
  async function loadDocument() {
    // Reset all values for the new document
    setLoading(true);
    setPages([]);
    setCurrentScale(1);
    setCurrentViewMode(PageViewMode.DEFAULT);
    setCurrentPage(1);
    if (!url) {
      return;
    }
    try {
      const source = await findDocumentSource(url);
      const d = await PdfJs.getDocument(source).promise;
      onLoadSuccess(d);
    } catch (error) {
      onLoadError(error);
    }
  }

  /**
   * Event triggered when the document finished loading
   *
   * @param document
   */
  function onLoadSuccess(document: PdfJs.PdfDocument) {
    setDocument(document);

    if (props.onLoadSuccess) {
      props.onLoadSuccess(document);
    }

    const _pages = [...new Array(document.numPages)].map(() => {
      return {
        ratio: 0,
        loaded: false,
      } as PageType;
    });
    setPages(_pages);
    setLoading(false);
  }

  /**
   * Even triggered in case the document failed to load
   *
   * @param error
   */
  function onLoadError(error: unknown) {
    setDocument(undefined);
    setLoading(false);

    if (props.onLoadError) {
      props.onLoadError(error);
    } else {
      throw error;
    }
  }

  /**
   * Touch events here
   */
  window['touchInfo'] = {
    startX: 0,
    startY: 0,
    startDistance: 0,
  };
  const touchInfo = window['touchInfo'];

  /**
   * Event triggered on double touch
   */
  function onDocumentDoubleTouch() {
    if (isTouchDevice) {
      switchFullscreenMode();
    }
  }

  let currentPinchScale = currentScale;

  /**
   * Event triggered when the user puts a finger on the screen
   * We only care here about events with 2 fingers on them so we can control pinch to zoom
   *
   * @param e
   */
  function onDocumentTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (e.touches.length > 1) {
      const startX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
      const startY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
      Object.assign(touchInfo, {
        startX,
        startY,
        startDistance: Math.hypot(e.touches[1].pageX - e.touches[0].pageX, e.touches[1].pageY - e.touches[0].pageY),
      });
    } else {
      Object.assign(touchInfo, {
        startX: 0,
        startY: 0,
        startDistance: 0,
      });
    }
  }

  /**
   * Event triggered when the user moves the finger around the screen
   * Since we only control pinch to zoom, we need to track how the distance between the fingers changed over time
   * Then we use that distance to calculate the relative scale and apply that scale using transforms
   * to avoid expensive re-renders, once the user let go the fingers we do a proper rendering of the PDF document
   *
   * @param e
   */
  function onDocumentTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (!isTouchDevice || touchInfo.startDistance <= 0 || e.touches.length < 2) {
      return;
    }
    const pinchDistance = Math.hypot(e.touches[1].pageX - e.touches[0].pageX, e.touches[1].pageY - e.touches[0].pageY);
    const originX = touchInfo.startX + documentRef.current.scrollLeft;
    const originY = touchInfo.startY + documentRef.current.scrollTop;
    currentPinchScale = pinchDistance / touchInfo.startDistance;

    // Adjust for min and max parameters over the absolute zoom (current zoom + pitch zoom)
    const absScale = currentPinchScale * currentScale;
    currentPinchScale = Math.min(Math.max(absScale, 0.2), 2.5) / currentScale;

    // Here we simulate the zooming effect with transform, not perfect, but better than a re-render
    documentRef.current.style.transform = `scale(${currentPinchScale})`;
    documentRef.current.style.transformOrigin = `${originX}px ${originY}px`;
  }

  /**
   * Event triggered when the user ends a touch event
   * If all went good and we are ending a pinch to zoom event we need to queue a rendering of the PDF pages
   * using the new zoom level
   */
  function onDocumentTouchEnd() {
    if (!isTouchDevice || touchInfo.startDistance <= 0) return;
    documentRef.current.style.transform = `none`;
    documentRef.current.style.transformOrigin = `unset`;

    const rect = documentRef.current.getBoundingClientRect();
    const dx = touchInfo.startX - rect.left;
    const dy = touchInfo.startY - rect.top;

    // I don't like this, but we need to make sure we change the scrolling after the re-rendering with the new zoom levels
    setTimeout(() => {
      documentRef.current.scrollLeft += dx * (currentPinchScale - 1);
      documentRef.current.scrollTop += dy * (currentPinchScale - 1);
    }, 0);

    Object.assign(touchInfo, {
      startDistance: 0,
      startX: 0,
      startY: 0,
    });
    onScaleChange(currentPinchScale * currentScale);
  }

  /**
   * Event triggered when the touch event gets cancelled
   * In this case we need to restart our touchInfo data so other things can continue as they were
   */
  function onTouchCancel() {
    if (isTouchDevice) {
      Object.assign(touchInfo, {
        startDistance: 0,
        startX: 0,
        startY: 0,
      });
    }
  }

  /**
   * Event triggered when a page visibility changes
   *
   * @param pageNumber
   * @param ratio
   */
  const onPageVisibilityChanged = (pageNumber: number, ratio: number): boolean => {
    // Ignore page change during pinch to zoom event
    // This needs to be done as page changes trigger a re-rendering
    // which conflicts with all the pinch to zoom events
    if (isTouchDevice && window['touchInfo'].startDistance > 0) return false;

    // Calculate in which page we are right now based on the scrolling position
    if (pages && pages.length) {
      pages[pageNumber - 1].ratio = ratio;
      const maxRatioPage = pages.reduce((maxIndex, item, index, array) => {
        return item.ratio > array[maxIndex].ratio ? index : maxIndex;
      }, 0);
      setCurrentPage(maxRatioPage + 1);
    } else {
      setCurrentPage(1);
    }
    return true;
  };

  /**
   * Event triggered when a page loaded
   *
   * @param pageNumber
   * @param width
   * @param height
   */
  const onPageLoaded = (pageNumber: number, width: number, height: number): void => {
    if (pages && pages.length) {
      pages[pageNumber - 1] = {
        ...pages[pageNumber - 1],
        loaded: true,
        width,
        height,
      };
      setPages([...pages]);
      // On the first time we default the view to the first page
      if (pageNumber === 1) {
        zoomToPageView(pages[0], currentViewMode);
      }
    }
  };
  /**
   * End of Touch events
   */

  /**
   * Event triggered when the user manually changes the zoom level
   * @param scale
   */
  function onScaleChange(scale: number) {
    setCurrentViewMode(PageViewMode.DEFAULT);
    zoomToScale(scale);
  }

  /**
   * Function used to navigate to a specific page
   *
   * @param pageNum
   */
  function navigateToPage(pageNum: number) {
    pageNum = Math.min(Math.max(pageNum, 1), pages.length);
    const ref = pages[pageNum - 1].ref; // Convert to index from pageNumber
    if (ref && documentRef.current) {
      setCurrentPage(pageNum);
      documentRef.current.scrollTo
        ? documentRef.current.scrollTo(0, ref.offsetTop - 20)
        : (documentRef.current.scrollTop = ref.offsetTop - 20);
    }
  }

  /**
   * Zooms the page to the given scale
   *
   * @param scale
   */
  function zoomToScale(scale: number) {
    setCurrentScale(Math.min(Math.max(scale, 0.2), 2.5));
  }

  /**
   * Zooms the page according to the page view mode
   *
   * @param pageProps
   * @param viewMode
   */
  function zoomToPageView(pageProps: PageType, viewMode: PageViewMode) {
    if (!documentRef.current || !pageProps || !pageProps.ref) {
      return;
    }

    const pageElement = pageProps.ref.firstChild as HTMLDivElement;
    const pageWidth = pageProps.width || pageElement.clientWidth;
    const pageHeight = pageProps.height || pageElement.clientHeight;
    const landscape = pageWidth > pageHeight;

    switch (viewMode) {
      case PageViewMode.DEFAULT: {
        if (landscape) {
          const desiredWidth = Math.round(documentRef.current.clientWidth - 32);
          zoomToScale(desiredWidth / pageWidth);
        } else {
          const desiredWidth = Math.round((documentRef.current.clientWidth - 32) * 0.7);
          zoomToScale(desiredWidth / pageWidth);
        }
        break;
      }
      case PageViewMode.FIT_TO_WIDTH: {
        const desiredWidth = Math.round(documentRef.current.clientWidth - 32);
        zoomToScale(desiredWidth / pageWidth);
        break;
      }
      case PageViewMode.FIT_TO_HEIGHT: {
        const desiredHeight = Math.round(documentRef.current.clientHeight - 32);
        zoomToScale(desiredHeight / pageHeight);
        break;
      }
      default:
        break;
    }
  }

  /**
   * Event triggered when the view mode changes
   */
  function onViewModeChange(viewMode: PageViewMode) {
    setCurrentViewMode(viewMode);
    zoomToPageView(pages[currentPage - 1], viewMode);
  }

  /**
   * Enables / Disables fullscreen mode
   */
  function switchFullscreenMode() {
    setFullscreen(!fullscreen);
  }

  return (
    <PDFWorker workerUrl={workerUrl}>
      <DocumentWrapper fullscreen={fullscreen}>
        <Document
          ref={documentRef}
          onTouchStart={onDocumentTouchStart}
          onTouchEnd={onDocumentTouchEnd}
          onTouchMove={onDocumentTouchMove}
          onTouchCancel={onTouchCancel}
          onDoubleClick={onDocumentDoubleTouch}>
          {loading ? (
            <PageWrapper>
              <PDFViewerPage
                onPageLoaded={onPageLoaded}
                onPageVisibilityChanged={onPageVisibilityChanged}
                pageNumber={1}
                loaded={false}
                scale={1}
              />
            </PageWrapper>
          ) : (
            document &&
            pages.map((_, index: number) => (
              <PageWrapper ref={(ref: HTMLDivElement | null) => (pages[index].ref = ref)} key={index}>
                <PDFViewerPage
                  onPageLoaded={onPageLoaded}
                  onPageVisibilityChanged={onPageVisibilityChanged}
                  disableSelect={props.disableSelect}
                  document={document}
                  loaded={pages[index].loaded}
                  pageNumber={index + 1}
                  scale={currentScale}
                />
              </PageWrapper>
            ))
          )}
        </Document>
        {!loading && !isTouchDevice && (
          <PDFViewerToolbar
            labels={props.toolbarLabels}
            currentPage={currentPage}
            currentViewMode={currentViewMode}
            numPages={pages.length}
            currentScale={currentScale}
            fullscreen={fullscreen}
            onPageChange={navigateToPage}
            onScaleChange={onScaleChange}
            onViewModeChange={onViewModeChange}
            onFullscreenChange={switchFullscreenMode}
          />
        )}
        {!loading && isTouchDevice && (
          <PDFViewerTouchToolbar
            labels={props.toolbarLabels}
            currentPage={currentPage}
            currentViewMode={currentViewMode}
            numPages={pages.length}
            currentScale={currentScale}
            fullscreen={fullscreen}
            onPageChange={navigateToPage}
            onScaleChange={onScaleChange}
            onViewModeChange={onViewModeChange}
            onFullscreenChange={switchFullscreenMode}
          />
        )}
      </DocumentWrapper>
    </PDFWorker>
  );
};

PDFViewer.displayName = 'PDFViewer';
