import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../../../assets/dashbord_logo.png';
import ShareButton from '../../ui/ShareButton';

function HeaderLogo({ isScrolled, isMobile, isSpecialPage, isCompactMode }) {
  if (isScrolled || isCompactMode) return null;
  
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
      {/* 左側のスペース（モバイルでバランスを取るため） */}
      <Box sx={{ width: isMobile ? '40px' : '60px' }} />
      
      {/* 中央のロゴ */}
      <RouterLink to="/" aria-label="トップページへ戻る">
        <Box
          component="img"
          src={logo}
          alt="目的ベースダッシュボードのロゴ"
          sx={{ 
            height: isMobile ? '34px' : '44px',
            objectFit: 'contain',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </RouterLink>
      
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
