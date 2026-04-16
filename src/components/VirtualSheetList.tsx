// read ../../AGENTS.md and ../../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import { useEffect, useMemo, useRef, useState } from "react";

type VirtualSheetListProps<T> = {
  items: T[];
  itemKey: (item: T) => string;
  jumpToKey?: string | null;
  renderItem: (item: T) => React.ReactNode;
};

export function VirtualSheetList<T>({ items, itemKey, jumpToKey, renderItem }: VirtualSheetListProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sizeMapRef = useRef<Record<string, number>>({});
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(720);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const updateHeight = () => {
      setViewportHeight(containerRef.current?.clientHeight ?? 720);
    };

    updateHeight();
    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const offsets = useMemo(() => {
    let total = 0;
    return items.map((item) => {
      const key = itemKey(item);
      const height = sizeMapRef.current[key] ?? 560;
      const offset = total;
      total += height + 20;
      return { key, offset, height };
    });
  }, [items, itemKey, version]);

  const totalHeight = offsets.length === 0 ? 0 : offsets[offsets.length - 1].offset + offsets[offsets.length - 1].height;
  const overscan = 900;
  const visible = offsets.filter(
    ({ offset, height }) => offset + height >= scrollTop - overscan && offset <= scrollTop + viewportHeight + overscan,
  );

  useEffect(() => {
    if (!jumpToKey || !containerRef.current) {
      return;
    }

    const target = offsets.find((entry) => entry.key === jumpToKey);
    if (!target) {
      return;
    }

    containerRef.current.scrollTo({
      top: Math.max(target.offset - 16, 0),
      behavior: "smooth",
    });
  }, [jumpToKey, offsets]);

  return (
    <div
      ref={containerRef}
      className="virtual-results-viewport"
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div className="virtual-results-spacer" style={{ height: totalHeight }}>
        {visible.map(({ key, offset }) => {
          const index = offsets.findIndex((entry) => entry.key === key);
          const item = items[index];

          return (
            <VirtualSheetMeasure
              key={key}
              offset={offset}
              onMeasure={(height) => {
                if (sizeMapRef.current[key] !== height) {
                  sizeMapRef.current[key] = height;
                  setVersion((current) => current + 1);
                }
              }}
            >
              {renderItem(item)}
            </VirtualSheetMeasure>
          );
        })}
      </div>
    </div>
  );
}

function VirtualSheetMeasure({
  children,
  offset,
  onMeasure,
}: {
  children: React.ReactNode;
  offset: number;
  onMeasure: (height: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return undefined;
    }

    const report = () => {
      if (ref.current) {
        onMeasure(ref.current.getBoundingClientRect().height);
      }
    };

    report();
    const observer = new ResizeObserver(() => report());
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [onMeasure]);

  return (
    <div ref={ref} className="virtual-results-item" style={{ transform: `translateY(${offset}px)` }}>
      {children}
    </div>
  );
}
