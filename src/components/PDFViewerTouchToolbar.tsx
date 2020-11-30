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
  color: ${themed(({ theme = {}, disabled }: StandardProps & AnchorProps) => (disabled ? theme.text3 : theme.text4))};
  font-size: 1rem;
  border: none;
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-color: ${themed(({ theme = {} }: StandardProps) => theme.ui5)};
  background-repeat: no-repeat, repeat;
  background-size: 0.65em auto, 100%;
  background-position: right center;
  padding-right: 1rem;
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
        <ToolbarItem>
          <ToolbarActionLink onClick={() => props.onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
            <Icon name="KeyboardArrowLeft" />
          </ToolbarActionLink>
        </ToolbarItem>
        <ToolbarItem>{labels.pagesOf(currentPage, props.numPages)}</ToolbarItem>
        <ToolbarItem>
          <ToolbarActionLink
            onClick={() => props.onPageChange(currentPage + 1)}
            disabled={currentPage >= props.numPages}>
            <Icon name="KeyboardArrowRight" />
          </ToolbarActionLink>
        </ToolbarItem>

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
