import * as React from 'react';
import { ActionLink, distance, Icon, styled, themed, StandardProps, AnchorProps } from 'precise-ui';
import { PageViewMode } from '../types/Page';
import { PDFViewerToolbarProps } from './PDFViewerToolbar';

const Toolbar = styled.ul`
  background-color: ${themed(({ theme = {} }: StandardProps) => theme.ui5)};
  color: ${themed(({ theme = {} }: StandardProps) => theme.text4)};
  padding: 0 ${distance.medium};
  display: flex;
  flex-direction: row;
  list-style: none;
  margin: 0;
  position: relative;
  align-items: center;
  border-radius: 2px;
`;

const ToolbarWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
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
  height: 25px;
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

const ToolbarSelect = styled.select`
  background-color: transparent;
  color: ${themed(({ theme = {}, disabled }: StandardProps & AnchorProps) => (disabled ? theme.text3 : theme.text4))};
  font-size: 1rem;
  border: none;

  &:after {
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #f00;
    position: absolute;
    top: 40%;
    right: 5px;
    content: '';
    z-index: 98;
  }
`;

const defaultLabels = {
  exitFullscreen: 'Exit Fullscreen',
  enterFullscreen: 'Enter Fullscreen',
  viewModeFitToHeight: 'Fit to Height',
  viewModeFitToWidth: 'Fit to Width',
  viewModeDefault: 'Custom View',
  nextPage: 'Next',
  prevPage: 'Previous',
  zoomIn: 'Zoom In',
  zoomOut: 'Zoom Out',
  pagesOf: (current, total) => `${current} / ${total}`,
  page: 'Page',
};

/**
 * The `Document` is a wrapper to load PDFs and render all the pages
 */
export const PDFViewerTouchToolbar: React.FC<PDFViewerToolbarProps> = props => {
  const { labels = defaultLabels, fullscreen, onFullscreenChange, currentPage } = props;

  function onViewModeChange(viewMode: string) {
    switch (viewMode) {
      case PageViewMode.FIT_TO_WIDTH.toString():
        props.onViewModeChange(PageViewMode.FIT_TO_WIDTH);
        break;
      case PageViewMode.FIT_TO_HEIGHT.toString():
        props.onViewModeChange(PageViewMode.FIT_TO_HEIGHT);
        break;
      case PageViewMode.DEFAULT.toString():
        props.onViewModeChange(PageViewMode.DEFAULT);
        break;
    }
  }

  return (
    <ToolbarWrapper>
      <Toolbar>
        <ToolbarItem>{labels.pagesOf(currentPage, props.numPages)}</ToolbarItem>

        <ToolbarSeparator />
        <ToolbarItem>
          <ToolbarSelect value={props.currentViewMode.toString()} onChange={e => onViewModeChange(e.target.value)}>
            <option value={PageViewMode.FIT_TO_WIDTH.toString()}>{labels.viewModeFitToWidth}</option>
            <option value={PageViewMode.FIT_TO_HEIGHT.toString()}>{labels.viewModeFitToHeight}</option>
            <option value={PageViewMode.DEFAULT.toString()}>{labels.viewModeDefault}</option>
          </ToolbarSelect>
        </ToolbarItem>

        <ToolbarSeparator />

        <ToolbarItem>
          <ToolbarActionLink onClick={onFullscreenChange}>
            <Icon name={fullscreen ? 'FullscreenExit' : 'Fullscreen'} size="24px" />
          </ToolbarActionLink>
        </ToolbarItem>
      </Toolbar>
    </ToolbarWrapper>
  );
};
