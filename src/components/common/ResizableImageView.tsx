import React, { useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

type ResizeAxis = 'both' | 'x' | 'y';
type HandleDir = { dx: -1 | 0 | 1; dy: -1 | 0 | 1; axis: ResizeAxis };

const HANDLES: { className: string; dir: HandleDir }[] = [
  // 코너 (자유 리사이즈)
  { className: 'resize-handle resize-handle-tl', dir: { dx: -1, dy: -1, axis: 'both' } },
  { className: 'resize-handle resize-handle-tr', dir: { dx: 1, dy: -1, axis: 'both' } },
  { className: 'resize-handle resize-handle-bl', dir: { dx: -1, dy: 1, axis: 'both' } },
  { className: 'resize-handle resize-handle-br', dir: { dx: 1, dy: 1, axis: 'both' } },
  // 변 중간 (단축 리사이즈)
  { className: 'resize-handle resize-handle-tm', dir: { dx: 0, dy: -1, axis: 'y' } },
  { className: 'resize-handle resize-handle-bm', dir: { dx: 0, dy: 1, axis: 'y' } },
  { className: 'resize-handle resize-handle-ml', dir: { dx: -1, dy: 0, axis: 'x' } },
  { className: 'resize-handle resize-handle-mr', dir: { dx: 1, dy: 0, axis: 'x' } },
];

export const ResizableImageView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const src = node.attrs.src as string;
  const width = node.attrs.width as number | undefined;
  const height = node.attrs.height as number | undefined;

  const startDrag = (e: React.MouseEvent, dir: HandleDir) => {
    e.preventDefault();
    e.stopPropagation();
    const img = imgRef.current;
    if (!img) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = img.offsetWidth;
    const startH = img.offsetHeight;

    const onMouseMove = (ev: MouseEvent) => {
      const attrs: Record<string, number> = {};

      if (dir.axis === 'x' || dir.axis === 'both') {
        const diffX = (ev.clientX - startX) * dir.dx;
        attrs.width = Math.max(30, startW + diffX);
      }
      if (dir.axis === 'y' || dir.axis === 'both') {
        const diffY = (ev.clientY - startY) * dir.dy;
        attrs.height = Math.max(30, startH + diffY);
      }

      updateAttributes(attrs);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const style: React.CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    ...(width ? { width: `${width}px` } : {}),
    ...(height ? { height: `${height}px` } : {}),
  };

  const imgStyle: React.CSSProperties = {
    display: 'block',
    width: width ? '100%' : undefined,
    height: height ? '100%' : undefined,
  };

  return (
    <NodeViewWrapper className="resizable-image-wrapper" data-drag-handle>
      <div
        className={`resizable-image-container ${selected ? 'selected' : ''}`}
        style={style}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          style={imgStyle}
          draggable={false}
        />
        {selected &&
          HANDLES.map((h) => (
            <div
              key={h.className}
              className={h.className}
              onMouseDown={(e) => startDrag(e, h.dir)}
            />
          ))}
      </div>
    </NodeViewWrapper>
  );
};
