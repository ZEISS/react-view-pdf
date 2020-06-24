import * as React from 'react';

interface VisibilityChangedProps {
  isVisible: boolean;
  ratio: number;
}

interface ObserverProps {
  threshold?: number | number[];
  onVisibilityChanged(params: VisibilityChangedProps): void;
}

const Observer: React.FC<ObserverProps> = ({ children, threshold, onVisibilityChanged }) => {
  const containerRef = React.useRef<HTMLDivElement | undefined>(undefined);

  React.useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const isVisible = entry.isIntersecting;
          const ratio = entry.intersectionRatio;
          onVisibilityChanged({ isVisible, ratio });
        });
      },
      {
        threshold: threshold || 0,
      },
    );
    const container = containerRef.current;
    if (!container) {
      return;
    }
    io.observe(container);

    return (): void => {
      io.unobserve(container);
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
};

export default Observer;
export type VisibilityChanged = VisibilityChangedProps;
