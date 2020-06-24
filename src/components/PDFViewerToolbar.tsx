import * as React from 'react';
import { ActionLink, distance, Flyout, Icon, styled, themed, Tooltip, StandardProps, AnchorProps } from 'precise-ui';
import { PageViewMode } from '../types/Page';
import { toCamel } from '../utils/hacks';

const Toolbar = styled.ul`
  background-color: ${themed(({ theme = {} }: StandardProps) => theme.ui5)};
  color: ${themed(({ theme = {} }: StandardProps) => theme.text4)};
  padding: 0 ${distance.medium};
  display: flex;
  flex-direction: row;
  list-style: none;
  margin: 0;

  position: relative;
  opacity: 0.1;
  transition: opacity 0.5s 1s ease-in-out;
`;

const ToolbarWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;

  :hover ${Toolbar} {
    transition: opacity 0.5s 0s ease-in-out;
    opacity: 1;
  }
`;

const ToolbarItem = styled.li`
  display: list-item;
  padding: ${distance.medium} ${distance.xxsmall};
`;

const ToolbarSeparator = styled.li`
  margin: ${distance.small} ${distance.medium};
  width: 1px;
  overflow: hidden;
  background-color: ${themed(({ theme = {} }: StandardProps) => theme.ui4)};
`;

const ToolbarTextField = styled.input`
  border: 0;
  padding: 0;
  height: 21px;
  width: 3em;
`;

const ToolbarDropdownListItem = styled.div`
  padding: ${distance.small} ${distance.medium};
  background-color: ${themed(({ theme = {} }: StandardProps) => theme.ui5)};
  white-space: nowrap;
`;

const ToolbarTooltip = styled(Tooltip)`
  font-size: 0.8em;
  white-space: nowrap;
`;

const ToolbarActionLink = styled(ActionLink)`
  color: ${themed(({ theme = {}, disabled }: StandardProps & AnchorProps) => (disabled ? theme.text3 : theme.text4))};
  display: flex;
  align-items: center;
  height: 16px;

  :hover,
  :visited,
  :focus {
    color: ${themed(({ theme = {}, disabled }: StandardProps & AnchorProps) => (disabled ? theme.text3 : theme.text4))};
  }
`;

const defaultLabels = {
  exitFullscreen: 'Exit Fullscreen',
  enterFullscreen: 'Enter Fullscreen',
  viewModeFitToHeight: 'Fit to Height',
  viewModeFitToWidth: 'Fit to Width',
  nextPage: 'Next',
  prevPage: 'Previous',
  zoomIn: 'Zoom In',
  zoomOut: 'Zoom Out',
  pagesOf: (current, total) => `Page ${current} of ${total}`,
  page: 'Page',
};

export type ToolbarLabelProps = {
  exitFullscreen?: string;
  enterFullscreen?: string;
  viewModeFitToWidth?: string;
  viewModeFitToHeight?: string;
  nextPage?: string;
  prevPage?: string;
  zoomIn?: string;
  zoomOut?: string;
  /**
   * Function that receives the current and total pages and returns a string with translations for number of pages
   * Example: 'Page 5 of 9' where 5 is the current page and 9 is the total.
   *
   * @param currentPage
   * @param totalPages
   */
  pagesOf?(currentPage: number, totalPages: number): string;
  /**
   * Used as a prefix when editing the current page.
   * Example: 'Page ____.'
   *
   */
  page?: string;
};

export interface PDFViewerToolbarProps {
  currentPage: number;
  currentViewMode: PageViewMode;
  numPages: number;
  currentScale: number;
  fullscreen: boolean;
  onPageChange(pageNum: number): void;
  onScaleChange(pageNum: number): void;
  onViewModeChange(viewMode: PageViewMode): void;
  onFullscreenChange(): void;
  labels?: ToolbarLabelProps;
}

/**
 * The `Document` is a wrapper to load PDFs and render all the pages
 */
export const PDFViewerToolbar: React.FC<PDFViewerToolbarProps> = props => {
  const { labels = defaultLabels, fullscreen, onFullscreenChange, currentPage, currentScale } = props;

  const pageInputRef = React.useRef<HTMLInputElement>();

  const [editingPageNumber, SetEditingPageNumber] = React.useState<boolean>();
  const [editingViewMode, SetEditingViewMode] = React.useState(false);

  /**
   * Returns the next view mode text to be used as tooltip
   */
  function getViewModeText() {
    return labels[`viewMode${toCamel(PageViewMode[props.currentViewMode >= 3 ? 0 : props.currentViewMode])}`];
  }

  /**
   * Returns the next view mode text to be used as tooltip
   */
  function getViewModeIcon() {
    switch (props.currentViewMode) {
      case PageViewMode.FIT_TO_WIDTH:
        return 'FitToWidth';
      case PageViewMode.FIT_TO_HEIGHT:
        return 'FitToHeight';
      case PageViewMode.DEFAULT:
        return 'Page';
    }
  }

  /**
   * Event triggered when the page number is clicked, thus entering page enter mode
   */
  function onPageNumberFocused() {
    SetEditingPageNumber(true);
  }

  React.useEffect(() => {
    if (pageInputRef.current) {
      pageInputRef.current.focus();
    }
  }, [pageInputRef, editingPageNumber]);

  /**
   * Event triggered when the page number field is blurred / changed
   */
  function onPageNumberDefocused() {
    SetEditingPageNumber(false);

    // Now let's check the value
    if (pageInputRef.current && pageInputRef.current.value !== '') {
      const inputPage = Number(pageInputRef.current.value);
      if (!isNaN(inputPage)) {
        props.onPageChange(inputPage);
      }
    }
  }

  function onViewModeChange(viewMode: PageViewMode) {
    SetEditingViewMode(false);
    props.onViewModeChange(viewMode);
  }

  return (
    <ToolbarWrapper>
      <Toolbar>
        <ToolbarItem>
          <ToolbarTooltip content={labels.prevPage} position="top" offset={16}>
            <ToolbarActionLink onClick={() => props.onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
              <Icon name="KeyboardArrowLeft" />
            </ToolbarActionLink>
          </ToolbarTooltip>
        </ToolbarItem>
        <ToolbarItem>
          {editingPageNumber ? (
            <>
              {labels.page} &nbsp;
              <ToolbarTextField
                ref={pageInputRef}
                onBlur={onPageNumberDefocused}
                onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && onPageNumberDefocused()}
              />
            </>
          ) : (
            <span onClick={onPageNumberFocused}>{labels.pagesOf(currentPage, props.numPages)}</span>
          )}
        </ToolbarItem>
        <ToolbarItem>
          <ToolbarTooltip content={labels.nextPage} position="top" offset={16}>
            <ToolbarActionLink
              onClick={() => props.onPageChange(currentPage + 1)}
              disabled={currentPage >= props.numPages}>
              <Icon name="KeyboardArrowRight" />
            </ToolbarActionLink>
          </ToolbarTooltip>
        </ToolbarItem>

        <ToolbarSeparator />

        <ToolbarItem>
          <ToolbarTooltip content={labels.zoomOut} position="top" offset={16}>
            <ToolbarActionLink
              onClick={() => {
                const scaleToPrev = Math.round((currentScale % 0.1) * 100) / 100;
                props.onScaleChange(currentScale - (scaleToPrev === 0 ? 0.1 : scaleToPrev));
              }}
              disabled={currentScale <= 0.5}>
              <Icon name="Remove" />
            </ToolbarActionLink>
          </ToolbarTooltip>
        </ToolbarItem>
        <ToolbarItem>{Math.round(currentScale * 100)}%</ToolbarItem>
        <ToolbarItem>
          <ToolbarTooltip content={labels.zoomIn} position="top" offset={16}>
            <ToolbarActionLink
              onClick={() => {
                const scaleToPrev = Math.round((currentScale % 0.1) * 100) / 100;
                props.onScaleChange(currentScale + 0.1 - (scaleToPrev === 0.1 ? 0 : scaleToPrev));
              }}
              disabled={currentScale >= 2.5}>
              <Icon name="Add" />
            </ToolbarActionLink>
          </ToolbarTooltip>
        </ToolbarItem>

        <ToolbarItem>
          <Flyout
            position="top"
            noGutter
            open={editingViewMode}
            offset={16}
            theme={{ flyout: { background: themed(({ theme = {} }: StandardProps) => theme.ui5) } }}
            content={
              <>
                <ToolbarDropdownListItem>
                  <ToolbarActionLink onClick={() => onViewModeChange(PageViewMode.FIT_TO_WIDTH)}>
                    <Icon name="FitToWidth" /> {labels.viewModeFitToWidth}
                  </ToolbarActionLink>
                </ToolbarDropdownListItem>
                <ToolbarDropdownListItem onClick={() => onViewModeChange(PageViewMode.FIT_TO_HEIGHT)}>
                  <ToolbarActionLink>
                    <Icon name="FitToHeight" /> {labels.viewModeFitToHeight}
                  </ToolbarActionLink>
                </ToolbarDropdownListItem>
              </>
            }>
            <ToolbarActionLink onClick={() => SetEditingViewMode(!editingViewMode)}>
              <Icon name={getViewModeIcon()} size="24px" />
              {getViewModeText()}
              <Icon name={editingViewMode ? 'ArrowDropUp' : 'ArrowDropDown'} size="24px" />
            </ToolbarActionLink>
          </Flyout>
        </ToolbarItem>

        <ToolbarSeparator />

        <ToolbarItem>
          <ToolbarTooltip
            content={fullscreen ? labels.exitFullscreen : labels.enterFullscreen}
            position="top"
            offset={16}>
            <ToolbarActionLink onClick={onFullscreenChange}>
              <Icon name={fullscreen ? 'FullscreenExit' : 'Fullscreen'} size="24px" />
            </ToolbarActionLink>
          </ToolbarTooltip>
        </ToolbarItem>
      </Toolbar>
    </ToolbarWrapper>
  );
};
