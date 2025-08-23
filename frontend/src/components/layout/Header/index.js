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
import PurposeActionSelect from './PurposeActionSelect';
import FunctionActionSelect from './FunctionActionSelect';
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

  // 現在のページタイプを判定（将来の拡張用）
  // const isDashboardPage = useCallback(() => {
  //   return ['/purpose', '/function'].includes(location.pathname);
  // }, [location.pathname]);

  const isPurposePage = location.pathname === '/purpose';
  const isFunctionPage = location.pathname === '/function';
  const isLandingPage = location.pathname === '/';
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // 現在の年月を自動的に設定するためのuseEffect
  // ただし、ダッシュボードページでは実行しない（Cookie復元を優先）
  useEffect(() => {
    // ダッシュボードページでは年月の自動設定を行わない
    if (isPurposePage || isFunctionPage) {
      return;
    }

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
  }, [selectedYear, selectedMonth, currentYear, currentMonth, setSelectedYear, setSelectedMonth, isPurposePage, isFunctionPage]);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const headerRef = useRef(null);
  
  useEffect(() => {
    if (isSpecialPage()) return; // 特定のページでは実行しない
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // 既存のスクロール検知（ヘッダーが画面外に出た時）
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setIsScrolled(headerBottom < 0);
      }
      
      // モバイル用の積極的コンパクト化（少しスクロールしただけで発動）
      if (isMobile) {
        setIsCompactMode(scrollY > 50); // 50px以上スクロールでコンパクト化
      } else {
        setIsCompactMode(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSpecialPage, isMobile]);
  
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

  // ランディングページではヘッダーを表示しない
  if (isLandingPage) {
    return null;
  }

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        ref={headerRef}
        sx={{
          top: 0,
          zIndex: 1100,
          padding: isCompactMode ? '1px 0' : (isScrolled ? (isMobile ? '2px 0' : '8px 0') : (isMobile ? '4px 0' : '8px 0')),
          background: isPurposePage 
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : isFunctionPage
            ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: isCompactMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : (isScrolled ? '0 4px 10px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)'),
          borderRadius: (isScrolled || isCompactMode) ? '0' : '0 0 8px 8px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isCompactMode ? 'scale(0.95)' : (isScrolled ? 'scale(0.98)' : 'scale(1)'),
          transformOrigin: 'top center',
          opacity: isCompactMode ? 0.95 : 1,
          filter: 'none',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          width: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: isCompactMode ? '1px 0' : (isScrolled ? '4px 0' : '0'),
        }}>
          {/* ロゴとタイトル部分 */}
          <HeaderLogo 
            isScrolled={isScrolled} 
            isMobile={isMobile} 
            isSpecialPage={isSpecialPage()}
            isCompactMode={isCompactMode}
          />
          
          {/* コントロール部分 - 特定のページでは表示しない */}
          {!isSpecialPage() && (
            <Paper elevation={0} sx={{
              backgroundColor: 'transparent',
              margin: isCompactMode ? (isMobile ? '0px 2px' : '3px 6px') : (isScrolled ? (isMobile ? '1px 4px' : '3px 6px') : (isMobile ? '4px 8px' : '8px 12px')),
              borderRadius: '8px',
              padding: isCompactMode ? (isMobile ? '1px' : '4px') : (isScrolled ? (isMobile ? '3px' : '4px') : (isMobile ? '6px' : '8px')),
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <Toolbar 
                sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between', 
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: isCompactMode ? (isMobile ? 0.2 : 0.8) : (isScrolled ? (isMobile ? 0.5 : 0.8) : (isMobile ? 1 : 1.2)),
                  padding: '0 !important',
                  minHeight: 'auto !important',
                  flexWrap: isMobile ? 'nowrap' : 'wrap',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* アクション選択部分 */}
                {isPurposePage ? (
                  <PurposeActionSelect 
                    isMobile={isMobile}
                    isTablet={isTablet}
                    isSmallDesktop={isSmallDesktop}
                    isScrolled={isScrolled}
                    isCompactMode={isCompactMode}
                    selectedAction={selectedAction}
                    handleActionChange={handleActionChange}
                    loading={loading}
                    actionChanging={actionChanging}
                  />
                ) : isFunctionPage ? (
                  <FunctionActionSelect 
                    isMobile={isMobile}
                    isTablet={isTablet}
                    isSmallDesktop={isSmallDesktop}
                    isScrolled={isScrolled}
                    isCompactMode={isCompactMode}
                    selectedAction={selectedAction}
                    handleActionChange={handleActionChange}
                    loading={loading}
                    actionChanging={actionChanging}
                  />
                ) : (
                  <ActionSelect 
                    isMobile={isMobile}
                    isTablet={isTablet}
                    isSmallDesktop={isSmallDesktop}
                    isScrolled={isScrolled}
                    isCompactMode={isCompactMode}
                    selectedAction={selectedAction}
                    handleActionChange={handleActionChange}
                    loading={loading}
                    actionChanging={actionChanging}
                  />
                )}
                
                {/* 計測場所・年月選択部分 */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'stretch', 
                    gap: isCompactMode ? 0.2 : (isScrolled ? 0.4 : 0.6),
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
                    isScrolled={isScrolled}
                    isCompactMode={isCompactMode}
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
                    isScrolled={isScrolled}
                    isCompactMode={isCompactMode}
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
