import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface LazyLoadProps {
  /** 需要懒加载的内容 */
  children: ReactNode;
  /** 加载状态显示的内容 */
  loading?: ReactNode;
  /** 未加载时显示的占位内容 */
  placeholder?: ReactNode;
  /** 触发加载的阈值，0-1之间的数值，默认0.1 */
  threshold?: number;
  /** 根元素的margin，用于扩大或缩小根元素的判定范围 */
  rootMargin?: string;
  /** 内容加载完成后的回调函数 */
  onLoad?: () => void;
  /** 是否强制立即加载 */
  forceLoad?: boolean;
}

/**
 * 懒加载组件，当元素进入视口时才加载内容
 * 适用于图片、列表项等非首屏内容的延迟加载
 */
const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  loading = <div className="lazy-load-loading">Loading...</div>,
  placeholder = null,
  threshold = 0.1,
  rootMargin = '0px',
  onLoad,
  forceLoad = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 加载内容
  const loadContent = () => {
    if (!isLoaded) {
      setIsLoaded(true);
      if (onLoad) {
        onLoad();
      }
      // 停止观察
      if (observerRef.current && containerRef.current) {
        observerRef.current.unobserve(containerRef.current);
      }
    }
  };

  // 设置交叉观察器
  useEffect(() => {
    // 如果已经加载或强制加载，则不需要观察
    if (isLoaded || forceLoad) {
      if (forceLoad && !isLoaded) {
        loadContent();
      }
      return;
    }

    // 检查浏览器是否支持IntersectionObserver
    if (!window.IntersectionObserver) {
      // 不支持的情况下直接加载
      loadContent();
      return;
    }

    // 创建观察器实例
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadContent();
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    // 开始观察目标元素
    const currentRef = containerRef.current;
    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    // 清理函数
    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [isLoaded, threshold, rootMargin, forceLoad]);

  // 渲染内容
  const renderContent = () => {
    if (isLoaded || forceLoad) {
      return children;
    }
    return loading ? loading : placeholder;
  };

  return (
    <div ref={containerRef} className="lazy-load-container">
      {renderContent()}
    </div>
  );
};

export default LazyLoad;
