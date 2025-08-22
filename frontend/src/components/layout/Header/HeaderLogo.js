import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, ButtonGroup } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import logo from '../../../assets/dashbord_logo.png';
import ShareButton from '../../ui/ShareButton';
import theme from '../../../theme/theme';

function HeaderLogo({ isScrolled, isMobile, isSpecialPage, isCompactMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  
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
      <Box sx={{ width: isMobile ? '40px' : '60px', display: 'flex', justifyContent: 'flex-start' }}>
        {isDashboardPage && !isMobile && (
          <ButtonGroup size="small" sx={{ minWidth: 'auto' }}>
            <Button
              variant={isPurposePage ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<BusinessIcon />}
              onClick={() => navigate('/purpose')}
              sx={{
                fontSize: '0.7rem',
                px: 1,
                py: 0.5,
                minWidth: 'auto',
                backgroundColor: isPurposePage ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.9)',
                color: isPurposePage ? 'white' : theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: isPurposePage ? theme.palette.primary.dark : 'rgba(74, 85, 104, 0.1)',
                }
              }}
            >
              目的
            </Button>
            <Button
              variant={isFunctionPage ? 'contained' : 'outlined'}
              color="secondary"
              startIcon={<AnalyticsIcon />}
              onClick={() => navigate('/function')}
              sx={{
                fontSize: '0.7rem',
                px: 1,
                py: 0.5,
                minWidth: 'auto',
                backgroundColor: isFunctionPage ? theme.palette.secondary.main : 'rgba(255, 255, 255, 0.9)',
                color: isFunctionPage ? 'white' : theme.palette.secondary.main,
                borderColor: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: isFunctionPage ? theme.palette.secondary.dark : 'rgba(85, 60, 154, 0.1)',
                }
              }}
            >
              機能
            </Button>
          </ButtonGroup>
        )}
      </Box>
      
      {/* 中央のロゴ */}
      <RouterLink to="/" aria-label="トップページへ戻る">
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
