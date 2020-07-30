import * as React from 'react';
import { styled, themed, distance, Skeleton, StandardProps } from 'precise-ui';
import { useDebouncedCallback } from 'use-debounce';
import PdfJs from '../utils/PdfJs';
import { range } from '../utils/hacks';
import Observer, { VisibilityChanged } from './Observer';

const Page = styled.div`
  margin-bottom: ${distance.xlarge};
  user-select: ${props => props.disableSelect && 'none'};
  display: block;
  background-color: ${themed(({ theme = {} }: StandardProps) => theme.ui1)};
  box-shadow: rgba(172, 181, 185, 0.4) 0 0 8px 0;
`;

export interface PDFViewerPageProps {
  document?: PdfJs.PdfDocument;
  pageNumber: number;
  scale: number;
  disableSelect?: boolean;
  loaded: boolean;
  onPageVisibilityChanged(pageIndex: number, ratio: number): void;
  onPageLoaded(pageNumber: number, width: number, height: number): void;
}

/**
 * The `Document` is a wrapper to load PDFs and render all the pages
 */
const PDFViewerPageInner: React.FC<PDFViewerPageProps> = props => {
  const { document, pageNumber, scale, onPageVisibilityChanged, onPageLoaded, loaded } = props;
  const [page, setPage] = React.useState<PdfJs.Page>();
  const [isCalculated, setIsCalculated] = React.useState(false);
  const canvasRef = React.createRef<HTMLCanvasElement>();
  const renderTask = React.useRef<PdfJs.PageRenderTask>();

  const [debouncedLoad] = useDebouncedCallback(() => loadPage(), 100, { leading: true });
  const [debouncedRender] = useDebouncedCallback(() => renderPage(), 100, { leading: true });

  const intersectionThreshold = [...Array(10)].map((_, i) => i / 10);

  React.useEffect(() => {
    debouncedRender();
  }, [page, scale]);

  function loadPage() {
    if (document && !page && !isCalculated) {
      setIsCalculated(true);
      document.getPage(pageNumber).then(page => {
        const viewport = page.getViewport({ scale: 1 });
        onPageLoaded(pageNumber, viewport.width, viewport.height);
        setPage(page);
      });
    }
  }

  function renderPage() {
    if (page) {
      const task = renderTask.current;

      if (task) {
        task.cancel();
      }

      const canvasEle = canvasRef.current as HTMLCanvasElement;
      if (!canvasEle) {
        return;
      }
      const viewport = page.getViewport({ scale });
      canvasEle.height = viewport.height;
      canvasEle.width = viewport.width;

      const canvasContext = canvasEle.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;

      renderTask.current = page.render({
        canvasContext,
        viewport,
      });
      renderTask.current.promise.then(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      );
    }
  }

  function visibilityChanged(params: VisibilityChanged) {
    const ratio = params.isVisible ? params.ratio : 0;
    if (params.isVisible) {
      debouncedLoad();
    }
    onPageVisibilityChanged(pageNumber, ratio);
  }

  return (
    <Page
      disableSelect={props.disableSelect}
      style={{
        width: !loaded && '70%',
        height: !loaded && '1200px',
        padding: !loaded && distance.large,
      }}>
      <Observer onVisibilityChanged={visibilityChanged} threshold={intersectionThreshold}>
        {!loaded && (
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
        <canvas ref={canvasRef} />
      </Observer>
    </Page>
  );
};

function areEqual(prevProps: PDFViewerPageProps, nextProps: PDFViewerPageProps) {
  return (
    prevProps.pageNumber === nextProps.pageNumber &&
    prevProps.disableSelect === nextProps.disableSelect &&
    prevProps.document === nextProps.document &&
    prevProps.loaded === nextProps.loaded &&
    (!nextProps.loaded || prevProps.scale === nextProps.scale) // if it's loading ignore the scale
  );
}

export const PDFViewerPage = React.memo(PDFViewerPageInner, areEqual);
