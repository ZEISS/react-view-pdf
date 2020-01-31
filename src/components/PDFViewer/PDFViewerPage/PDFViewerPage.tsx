import * as React from 'react';
import { styled, themed, distance, Skeleton, StandardProps } from 'precise-ui';
import { PDFDocumentProxy, PDFPageProxy, PDFPageViewport } from 'pdfjs-dist';
import { range } from '../../../utils/hacks';
import { ExtendedPDFRenderTask } from '../../../types/pdfViewer';

const Page = styled.div`
  margin-bottom: ${distance.xlarge};
  user-select: none;
  display: block;
  background-color: ${themed(({ theme = {} }: StandardProps) => theme.ui1)};
  box-shadow: rgba(172, 181, 185, 0.4) 0 0 8px 0;
`;

export interface PDFViewerPageProps {
  document?: PDFDocumentProxy;
  currentPage: number;
  pageNumber: number;
  scale: number;

  onPageLoaded(pageNum: number, pageWidth: number, pageHeight: number): void;
  onPageError?(pageNum: number, error: string): void;
}

/**
 * The `Document` is a wrapper to load PDFs and render all the pages
 */
export const PDFViewerPage: React.FC<PDFViewerPageProps> = props => {
  const { document, currentPage, pageNumber, scale } = props;
  const [page, setPage] = React.useState<PDFPageProxy>();
  const [viewport, setViewport] = React.useState<PDFPageViewport>();
  const [loading, setLoading] = React.useState(true);
  const [renderTask, setRenderTask] = React.useState<ExtendedPDFRenderTask>();
  const [canvasContext, setCanvasContext] = React.useState<CanvasRenderingContext2D | null>();

  React.useEffect(() => {
    if (document) {
      document.getPage(pageNumber).then(page => {
        const viewport = page.getViewport({ scale });
        setViewport(viewport);
        setPage(page);
        props.onPageLoaded(pageNumber, viewport.width, viewport.height);
      });
    }
  }, [document]);

  React.useEffect(() => {
    // If loading, make sure only the first 2 pages triggers the rendering
    (loading && pageNumber > 2) || renderPage();
  }, [canvasContext, scale, page]);

  React.useEffect(() => {
    if (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1 && loading) {
      renderPage();
    }
  }, [currentPage]);

  function renderPage() {
    if (page && canvasContext) {
      if (renderTask && !renderTask._internalRenderTask.running) {
        renderTask.cancel();
      }

      const viewport = page.getViewport({ scale });
      setViewport(viewport);

      const renderContext = {
        canvasContext,
        viewport,
      };
      const _renderTask = page.render(renderContext);
      setRenderTask(_renderTask as ExtendedPDFRenderTask);
      _renderTask.promise.then(
        () => {
          setLoading(false);
        },
        error => {
          props.onPageError && props.onPageError(pageNumber, error);
        },
      );
    }
  }

  return (
    <Page
      style={{
        width: loading && '70%',
        height: loading && '1200px',
        padding: loading && distance.large,
      }}>
      {loading && (
        <>
          <Skeleton width="30%" height="3em" />
          <br />
          <br />
          {range(5).map(index => (
            <React.Fragment key={index}>
              <Skeleton width="80%" height="1em" />
              <br />
              <Skeleton width="70%" height="1em" />
              <br />
              <Skeleton width="85%" height="1em" />
              <br />
              <Skeleton width="60%" height="1em" />
              <br />
              <Skeleton width="80%" height="1em" />
              <br />
              <Skeleton width="25%" height="1em" />
              <br />
              <Skeleton width="60%" height="1em" />
              <br />
              <Skeleton width="38%" height="1em" />
              <br />
              <Skeleton width="50%" height="1em" />
              <br />
            </React.Fragment>
          ))}
        </>
      )}
      <canvas
        ref={(ref: HTMLCanvasElement) => ref && setCanvasContext(ref.getContext('2d'))}
        width={viewport && viewport.width}
        height={viewport && viewport.height}
      />
    </Page>
  );
};
