import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';
import logo from '../../../assets/dashbord_logo.png';
import ShareButton from '../../ui/ShareButton';
import theme from '../../../theme/theme';

function HeaderLogo({ isScrolled, isMobile, isSpecialPage, isCompactMode }) {
  const location = useLocation();
  
  if (isScrolled || isCompactMode) return null;
  
  const isPurposePage = location.pathname === '/purpose';
  const isFunctionPage = location.pathname === '/function';
  const isDashboardPage = isPurposePage || isFunctionPage;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: (isMobile || isSpecialPage) ? 'none' : '1px solid rgba(255,255,255,0.3)',
      py: isMobile ? 0.5 : 0.6,
      px: isMobile ? 2 : 2.5,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: isScrolled ? 0 : 1,
      transform: isScrolled ? 'translateY(-20px)' : 'translateY(0)',
    }}>
      {/* 左側：ダッシュボード切り替えボタン（ダッシュボードページのみ） */}
      <Box sx={{ width: isMobile ? '80px' : '120px', display: 'flex', justifyContent: 'flex-start' }}>
        {isDashboardPage && (
          <Button
            component="a"
            href={isPurposePage ? '/function' : '/purpose'}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{
              fontSize: isMobile ? '0.65rem' : '0.75rem',
              px: isMobile ? 0.8 : 1.2,
              py: isMobile ? 0.4 : 0.6,
              minWidth: 'auto',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: isPurposePage ? theme.palette.secondary.main : theme.palette.primary.main,
              borderColor: isPurposePage ? theme.palette.secondary.main : theme.palette.primary.main,
              textDecoration: 'none',
              '&:hover': {
                backgroundColor: isPurposePage 
                  ? 'rgba(85, 60, 154, 0.1)' 
                  : 'rgba(74, 85, 104, 0.1)',
                textDecoration: 'none',
              },
              whiteSpace: 'nowrap'
            }}
          >
            {isPurposePage ? '機能ベースへ' : '目的ベースへ'}
          </Button>
        )}
      </Box>
      
      {/* 中央のロゴ */}
      <a href="/" aria-label="トップページへ戻る" style={{ textDecoration: 'none' }}>
        <Box
          component="img"
          src={logo}
          alt="高山市AIカメラデータダッシュボードのロゴ"
          sx={{ 
            height: isMobile ? '34px' : '44px',
            objectFit: 'contain',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </a>
      
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
};

export default HeaderLogo;
