import * as React from 'react';
import { debounce, distance, styled, themed, StandardProps } from 'precise-ui';
import PdfJs from '../utils/PdfJs';
import { PageViewMode, PageType } from '../types/Page';
import { PDFViewerPage } from './PDFViewerPage';
import { dataURItoUint8Array, isDataURI } from '../utils/hacks';
import { PDFViewerToolbar, ToolbarLabelProps } from './PDFViewerToolbar';
import { PDFWorker } from './PDFWorker';

interface FullscreenableElement {
  fullscreen: boolean;
}

const DocumentWrapper = styled.div`
  background-color: red;
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  overflow: hidden;

  ${({ fullscreen }: FullscreenableElement) =>
    fullscreen &&
    `
      padding-top: 0;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      position: fixed;
      z-index: 100500;
    `};
`;

const Document = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: ${themed(({ theme = {} }: StandardProps) => theme.ui2)};
  padding: ${distance.medium};
  overflow: scroll;
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

const defaultWorkerUrl = 'https://unpkg.com/pdfjs-dist@2.4.456/build/pdf.worker.min.js';

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
    zoomToPageView(pages[currentPage], currentViewMode);
  }, [fullscreen]);

  /**
   * Effect responsible for registering/unregistering the resize spy to determine the rendering sizes
   */
  React.useLayoutEffect(() => {
    const handleResize = debounce(() => zoomToPageView(pages[currentPage], currentViewMode), 500);
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
   * Event triggered when a page visibility changes
   *
   * @param pageNumber
   * @param ratio
   */
  const onPageVisibilityChanged = (pageNumber: number, ratio: number): void => {
    if (pages && pages.length) {
      pages[pageNumber - 1].ratio = ratio;
      const maxRatioPage = pages.reduce((maxIndex, item, index, array) => {
        return item.ratio > array[maxIndex].ratio ? index : maxIndex;
      }, 0);
      setCurrentPage(maxRatioPage + 1);
    } else {
      setCurrentPage(1);
    }
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
    }
  };

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
    const pageWidth = pageProps.width || pageElement.offsetWidth;
    const pageHeight = pageProps.height || pageElement.offsetHeight;
    const landscape = pageWidth > pageHeight;

    switch (viewMode) {
      case PageViewMode.DEFAULT: {
        if (landscape) {
          const desiredWidth = Math.round(documentRef.current.offsetWidth * 0.9);
          zoomToScale(desiredWidth / pageWidth);
        } else {
          const desiredWidth = Math.round(documentRef.current.offsetWidth * 0.7);
          zoomToScale(desiredWidth / pageWidth);
        }
        break;
      }
      case PageViewMode.FIT_TO_WIDTH: {
        const desiredWidth = Math.round(documentRef.current.offsetWidth * 0.95);
        // eslint-disable-next-line no-debugger
        debugger;
        zoomToScale(desiredWidth / pageWidth);
        break;
      }
      case PageViewMode.FIT_TO_HEIGHT: {
        const desiredHeight = Math.round(documentRef.current.offsetHeight * 0.95);
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
    zoomToPageView(pages[currentPage], viewMode);
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
        <Document ref={documentRef}>
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
        {!loading && (
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
      </DocumentWrapper>
    </PDFWorker>
  );
};

PDFViewer.displayName = 'PDFViewer';
