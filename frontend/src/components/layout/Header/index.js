import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AppBar, 
  Box,
  Paper, 
  Toolbar, 
  useMediaQuery 
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import theme from '../../../theme/theme';
import { useCalendar } from '../../../contexts/CalendarContext';

// コンポーネントのインポート
import HeaderLogo from './HeaderLogo';
import ActionSelect from './ActionSelect';
import DateSelect from './DateSelect';
import LocationSelect from './LocationSelect';
import CameraModal from './CameraModal';

function Header() {
  const {
    selectedAction,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedLocation,
    fetchCalendarData,
    loading,
    actionChanging,
    locationChanging,
    dateChanging,
    handleActionChange,
    handleLocationChange,
    updateMonthAndFetch
  } = useCalendar();
  
  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(min-width:769px) and (max-width:1024px)');
  const isSmallDesktop = useMediaQuery('(min-width:1025px) and (max-width:1280px)');
  const location = useLocation();
  
  // 特定のページかどうかをチェック
  const isSpecialPage = useCallback(() => {
    return ['/terms', '/how-to-use', '/sitemap'].includes(location.pathname);
  }, [location.pathname]);
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // 現在の年月を自動的に設定するためのuseEffect
  useEffect(() => {
    // 年月が未選択の場合のみ自動設定する
    if (!selectedYear) {
      setSelectedYear(currentYear.toString());
    }

    // 年が選択されていて月が未選択の場合、または
    // 年を現在の年に自動設定した場合に月も自動設定する
    if (selectedYear && !selectedMonth) {
      // 選択された年が現在の年であれば現在の月を、それ以外は12月を設定
      const monthToSet = selectedYear === currentYear.toString() ? currentMonth.toString() : "12";
      setSelectedMonth(monthToSet);
    }
  }, [selectedYear, selectedMonth, currentYear, currentMonth, setSelectedYear, setSelectedMonth]);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCondensed, setIsCondensed] = useState(false);
  const headerRef = useRef(null);

  // 可視化が表示されているか（初期状態ではない）
  const hasVisualization = !!(selectedAction && selectedLocation);
  
  useEffect(() => {
    if (isSpecialPage()) return; // 特定のページでは実行しない
    
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setIsScrolled(headerBottom < 0);
      }
      // モバイルで可視化が表示されている場合、少しのスクロールでコンパクト化
      if (isMobile && hasVisualization) {
        setIsCondensed(window.scrollY > 24);
      } else {
        setIsCondensed(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // 初期評価
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSpecialPage, isMobile, hasVisualization]);

  const isCompact = isScrolled || isCondensed;
  
  // カメラ画像モーダルの状態管理
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // カメラ画像モーダルを開く関数
  const handleCameraButtonClick = () => {
    setIsCameraModalOpen(true);
  };

  // カメラ画像モーダルを閉じる関数
  const handleCameraModalClose = () => {
    setIsCameraModalOpen(false);
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        ref={headerRef}
        sx={{
          top: 0,
          zIndex: 1100,
          padding: isCompact ? (isMobile ? '2px 0' : '8px 0') : (isMobile ? '4px 0' : '8px 0'),
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: isCompact ? '0 4px 10px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: isCompact ? '0' : '0 0 8px 8px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isCompact ? 'scale(0.98)' : 'scale(1)',
          transformOrigin: 'top center',
          opacity: 1,
          filter: 'none',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          width: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: isCompact ? '4px 0' : '0',
        }}>
          {/* ロゴとタイトル部分 */}
          <HeaderLogo 
            isScrolled={isCompact} 
            isMobile={isMobile} 
            isSpecialPage={isSpecialPage()}
          />
          
          {/* コントロール部分 - 特定のページでは表示しない */}
          {!isSpecialPage() && (
            <Paper elevation={0} sx={{
              backgroundColor: 'transparent',
              margin: isCompact ? (isMobile ? '1px 4px' : '3px 6px') : (isMobile ? '4px 8px' : '8px 12px'),
              borderRadius: '8px',
              padding: isCompact ? (isMobile ? '3px' : '4px') : (isMobile ? '6px' : '8px'),
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <Toolbar 
                sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between', 
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: isCompact ? (isMobile ? 0.5 : 0.8) : (isMobile ? 1 : 1.2),
                  padding: '0 !important',
                  minHeight: 'auto !important',
                  flexWrap: isMobile ? 'nowrap' : 'wrap',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* アクション選択部分 */}
                <ActionSelect 
                  isMobile={isMobile}
                  isTablet={isTablet}
                  isSmallDesktop={isSmallDesktop}
                  isScrolled={isCompact}
                  selectedAction={selectedAction}
                  handleActionChange={handleActionChange}
                  loading={loading}
                  actionChanging={actionChanging}
                />
                
                {/* 計測場所・年月選択部分 */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'stretch', 
                    gap: isCompact ? 0.4 : 0.6,
                    marginLeft: isMobile ? 0 : '0',
                    marginTop: isMobile ? 0 : 0,
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'flex-end',
                    flexWrap: 'nowrap'
                  }}
                >
                  {/* データの年・月セクション */}
                  <DateSelect 
                    isMobile={isMobile}
                    isTablet={isTablet}
                    isSmallDesktop={isSmallDesktop}
                    isScrolled={isCompact}
                    selectedAction={selectedAction}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    loading={loading}
                    dateChanging={dateChanging}
                    updateMonthAndFetch={updateMonthAndFetch}
                  />

                  {/* 計測場所セクション */}
                  <LocationSelect 
                    isMobile={isMobile}
                    isSmallDesktop={isSmallDesktop}
                    isScrolled={isCompact}
                    selectedLocation={selectedLocation}
                    handleLocationChange={handleLocationChange}
                    loading={loading}
                    locationChanging={locationChanging}
                    onCameraButtonClick={handleCameraButtonClick}
                  />
                </Box>
              </Toolbar>
            </Paper>
          )}
        </Box>
      </AppBar>
      
      {/* カメラ画像モーダル */}
      <CameraModal 
        open={isCameraModalOpen}
        onClose={handleCameraModalClose}
        isMobile={isMobile}
      />
    </>
  );
}

export default Header;
