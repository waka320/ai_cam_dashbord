import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  FormControl, 
  Select, 
  MenuItem, 
  CircularProgress 
} from '@mui/material';
import theme from '../../../theme/theme';

function PurposeActionSelect({ 
  isMobile, 
  isTablet, 
  isSmallDesktop, 
  isScrolled, 
  isCompactMode,
  selectedAction, 
  handleActionChange, 
  loading, 
  actionChanging 
}) {
  // 目的ベースの選択肢のみ
  const menuItems = [
    { value: "today_details", label: "今日について詳しく知りたい", shortLabel: "今日について詳しく知る" },
    { value: "cal_holiday", label: "店舗の定休日を検討したい", shortLabel: "店舗の定休日を検討" },
    { value: "cal_shoping_holiday", label: "商店街の定休日を検討したい", shortLabel: "商店街の定休日を検討" },
    { value: "cal_long_holiday", label: "長期休暇のタイミングを検討したい", shortLabel: "長期休暇のタイミングを検討" },
    { value: "cal_event", label: "イベントの開催日程を検討したい", shortLabel: "イベントの開催日程を検討" },
    { value: "cal_training", label: "研修のタイミングを検討したい", shortLabel: "研修のタイミングを検討" },
    { value: "dti_event_time", label: "イベントの開催時刻を検討したい", shortLabel: "イベントの開催時刻を検討" },
    { value: "wti_shift", label: "アルバイトのシフトを検討したい", shortLabel: "アルバイトのシフトを検討" },
    { value: "dti_open_hour", label: "お店の営業時刻を検討したい", shortLabel: "お店の営業時刻を検討" },
    { value: "dti_shoping_open_hour", label: "商店街の営業時刻を検討したい", shortLabel: "商店街の営業時刻を検討" },
  ];

  const handleSelectChange = (event) => {
    handleActionChange(event.target.value);
  };

  // CalendarContext側で適切に処理されるため、正規化は不要

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        width: isMobile ? '100%' : isTablet || isSmallDesktop ? '100%' : 'auto',
        gap: isCompactMode ? (isMobile ? 0.3 : 0.8) : (isScrolled ? (isMobile ? 0.5 : 0.8) : (isMobile ? 1 : 1.2)),
        mb: 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Typography
        variant={isMobile ? "bodyL" : "h6"}
        sx={{
          marginRight: isMobile ? 0 : '10px',
          color: theme.palette.text.white,
          fontWeight: 'bold',
          textAlign: 'left',
          fontSize: isCompactMode ?
            (isMobile ? '0.7rem' : '0.9rem') :
            (isScrolled ? 
              (isMobile ? '0.75rem' : '0.9rem') : 
              (isMobile ? '0.9rem' : isTablet || isSmallDesktop ? '1.1rem' : undefined)),
          whiteSpace: 'nowrap',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        やりたいことは...
      </Typography>

      <FormControl 
        variant="outlined" 
        sx={{ 
          minWidth: isMobile ? '100%' : isTablet ? '300px' : '350px',
          maxWidth: isMobile ? 'none' : '400px',
          flex: isMobile ? 'none' : 1,
          opacity: actionChanging ? 0.7 : 1,
          transition: 'opacity 0.3s ease',
          position: 'relative',
          '& .MuiOutlinedInput-root': {
            height: isCompactMode ? (isMobile ? '24px' : '34px') : (isScrolled ? (isMobile ? '28px' : '34px') : (isMobile ? '32px' : '44px')),
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }
        }}
        disabled={actionChanging}
      >
        <Select
          value={selectedAction}
          onChange={handleSelectChange}
          disabled={loading || actionChanging}
          displayEmpty
          renderValue={(value) => {
            if (value === "") return "未入力";
            const selectedItem = menuItems.find((item) => item.value === value);
            return selectedItem ? (isMobile ? selectedItem.shortLabel : selectedItem.label) : "";
          }}
          endAdornment={
            actionChanging ? (
              <CircularProgress 
                size={16} 
                sx={{ 
                  marginRight: 2,
                  color: 'white'
                }} 
              />
            ) : null
          }
          sx={{
            backgroundColor: actionChanging ? 'rgba(255, 255, 255, 0.8)' : 'white',
            borderRadius: '8px',
            border: '2px solid rgba(74, 85, 104, 0.2)', // 目的ベース用のボーダー
            '.MuiSelect-icon': { 
              color: actionChanging ? 'rgba(0, 0, 0, 0.38)' : theme.palette.primary.main, // 目的ベースアイコン
              display: actionChanging ? 'none' : 'block',
              right: isMobile ? '4px' : '8px',
              fontSize: isMobile ? '1rem' : '1.25rem'
            },
            ...theme.typography.bodyM,
            padding: isMobile ? '4px 4px' : '4px 8px',
            '& .MuiOutlinedInput-input': {
              padding: isMobile ? '4px 4px 4px 8px' : isSmallDesktop ? '4px 4px' : '4px 8px',
            },
            color:
              selectedAction === ""
                ? theme.palette.text.secondary
                : theme.palette.primary.main, // 目的ベーステキスト
            fontSize: isCompactMode ?
              (isMobile ? '0.65rem' : '0.85rem') :
              (isScrolled ? 
                (isMobile ? '0.7rem' : '0.85rem') : 
                (isMobile ? '0.85rem' : '0.95rem')),
            '& .MuiSelect-select': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 500
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: theme.palette.primary.main,
            }
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: isMobile ? 240 : 320,
                width: 'auto',
                maxWidth: '85vw',
                borderRadius: '8px',
                marginTop: '8px',
                border: '1px solid rgba(74, 85, 104, 0.2)'
              },
            },
          }}
        >
          {menuItems.map((item) => (
            <MenuItem 
              key={item.value} 
              value={item.value}
              sx={{
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                minHeight: isMobile ? '40px' : '48px',
                fontWeight: 400,
                '&:hover': {
                  backgroundColor: 'rgba(74, 85, 104, 0.08)'
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(74, 85, 104, 0.12)',
                  '&:hover': {
                    backgroundColor: 'rgba(74, 85, 104, 0.16)'
                  }
                }
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Select>
        
        {actionChanging && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              zIndex: 10
            }}
          >
            <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
          </Box>
        )}
      </FormControl>
    </Box>
  );
}

PurposeActionSelect.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  isTablet: PropTypes.bool.isRequired,
  isSmallDesktop: PropTypes.bool.isRequired,
  isScrolled: PropTypes.bool.isRequired,
  isCompactMode: PropTypes.bool,
  selectedAction: PropTypes.string,
  handleActionChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  actionChanging: PropTypes.bool.isRequired,
};

export default PurposeActionSelect;
