import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import purposeLogo from '../../../assets/dashbord_logo.png';
import ShareButton from '../../ui/ShareButton';
import theme from '../../../theme/theme';

/* eslint-disable no-unused-vars */
function HeaderLogo({ 
  isScrolled,
  isMobile, 
  isSpecialPage, 
  isCompactMode = false,
  onLogoClick = null,
  isControlsCollapsed = false
}) {
  /* eslint-enable no-unused-vars */
  const location = useLocation();
  
  const isFunctionPage = location.pathname === '/function';
  const isPurposePage = location.pathname === '/purpose';
  
  const switchButtonConfig = isFunctionPage
    ? {
        href: '/purpose',
        label: '目的ベースへ',
        color: theme.palette.primary.main,
        hoverBg: 'rgba(74, 85, 104, 0.1)'
      }
    : isPurposePage
    ? {
        href: '/function',
        label: 'グラフベースへ',
        color: theme.palette.secondary.main,
        hoverBg: 'rgba(85, 60, 154, 0.1)'
      }
    : null;
  
  // ページに応じてロゴを選択
  const renderLogoContent = () => {
    if (isFunctionPage) {
      return (
        <Box
          sx={{
            height: isMobile ? '34px' : '44px',
            display: 'flex',
            alignItems: 'center',
            color: '#fff'
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: isMobile ? '1rem' : '1.3rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap'
            }}
          >
            グラフベースダッシュボード
          </Typography>
        </Box>
      );
    }
    return (
      <Box
        component="img"
        src={purposeLogo}
        alt="高山市AIカメラデータダッシュボード（目的ベース）のロゴ"
        sx={{
          height: isMobile ? '34px' : '44px',
          objectFit: 'contain',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    );
  };
  
  const handleLogoClick = useCallback((event) => {
    if (!onLogoClick) return;
    event.preventDefault();
    onLogoClick();
  }, [onLogoClick]);

  const renderLogoWrapper = () => {
    if (onLogoClick) {
      return (
        <Box
          component="button"
          type="button"
          onClick={handleLogoClick}
          aria-label="条件パネルの表示切り替え"
          sx={{
            border: 'none',
            background: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            zIndex: 10,
            position: 'relative'
          }}
        >
          {renderLogoContent()}
        </Box>
      );
    }

    return (
      <Box
        role="img"
        aria-label="ダッシュボードロゴ"
        sx={{ textDecoration: 'none' }}
      >
        {renderLogoContent()}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: (isMobile || isSpecialPage) ? 'none' : '1px solid rgba(255,255,255,0.3)',
      py: isMobile ? 0.5 : 0.6,
      px: isMobile ? 2 : 2.5,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* 左側：ダッシュボード切り替えボタン */}
      <Box sx={{ width: isMobile ? '80px' : '120px', display: 'flex', justifyContent: 'flex-start' }}>
        {switchButtonConfig && (
          <Button
            component="a"
            href={switchButtonConfig.href}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{
              fontSize: isMobile ? '0.65rem' : '0.75rem',
              px: isMobile ? 0.8 : 1.2,
              py: isMobile ? 0.4 : 0.6,
              minWidth: 'auto',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: switchButtonConfig.color,
              borderColor: switchButtonConfig.color,
              textDecoration: 'none',
              '&:hover': {
                backgroundColor: switchButtonConfig.hoverBg,
                textDecoration: 'none',
              },
              whiteSpace: 'nowrap'
            }}
          >
            {switchButtonConfig.label}
          </Button>
        )}
      </Box>
      
      {/* 中央のロゴ */}
      {renderLogoWrapper()}
      
      {/* 右側の共有ボタン */}
      {!isSpecialPage && (
        <Box sx={{ 
          '& .MuiButton-root': {
            height: isMobile ? '28px' : '36px',
            minWidth: isMobile ? '60px' : '80px',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            padding: isMobile ? '4px 8px' : '6px 12px',
            '& .MuiButton-startIcon': {
              marginRight: isMobile ? '4px' : '6px',
              '& svg': {
                fontSize: isMobile ? '1rem' : '1.1rem'
              }
            }
          }
        }}>
          <ShareButton 
            variant='button' 
            size='small'
          />
        </Box>
      )}
    </Box>
  );
}

HeaderLogo.propTypes = {
  isScrolled: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isSpecialPage: PropTypes.bool.isRequired,
  isCompactMode: PropTypes.bool,
  onLogoClick: PropTypes.func,
  isControlsCollapsed: PropTypes.bool,
};

export default HeaderLogo;
