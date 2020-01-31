import * as React from 'react';
import { PDFViewer } from '../../src/components/PDFViewer';

export const App: React.FC = () => {
  return (
    <div style={{ width: '50%', margin: '0 auto' }}>
      <h1>React View PDF</h1>
      <PDFViewer url="https://zeiss.azureedge.net/quick_guide_miloop_en-49fcfc.pdf" />
    </div>
  );
};
