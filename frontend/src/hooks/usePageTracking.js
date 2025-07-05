import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ページビューのトラッキング用
const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Google Analytics のページビューを送信
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-PGMVB81E3M', {
        page_path: location.pathname + location.search,
      });
    }

    // Search Console への通知（本番環境でのみ実行）
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === 'production') {
      console.log(`Page view: ${location.pathname}`);
    }
  }, [location]);
};

export default usePageTracking;
