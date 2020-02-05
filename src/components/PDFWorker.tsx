import * as React from 'react';
import PdfJs from '../utils/PdfJs';

interface PDFWorkerProps {
  workerUrl: string;
}

export const PDFWorker: React.FC<PDFWorkerProps> = ({ children, workerUrl }) => {
  PdfJs.GlobalWorkerOptions.workerSrc = workerUrl;
  return <>{children}</>;
};
