import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  FormControl, 
  Select, 
  MenuItem, 
  CircularProgress, 
  Button,
  Tooltip
} from '@mui/material';
import theme from '../../../theme/theme';

function LocationSelect({ 
  isMobile, 
  isScrolled,
  isSmallDesktop,
  selectedLocation, 
  handleLocationChange,
  loading,
  locationChanging,
  onCameraButtonClick
}) {
  // 計測場所の選択肢
  const locationItems = [
    // 観光案内所データを先頭に追加
    { value: "old-town", label: "古い町並" },
    { value: "station", label: "駅前" },
    { value: "gyouzinbashi", label: "行神橋" },
    // 既存のデータ
    { value: "omotesando", label: "表参道" },
    { value: "yottekan", label: "よって館しもちょう" },
    { value: "honmachi4", label: "本町4丁目商店街" },
    { value: "honmachi3", label: "本町3丁目商店街" },
    { value: "honmachi2", label: "本町2丁目商店街" },
    { value: "kokubunjidori", label: "国分寺通り 第二商店街" },
    { value: "yasukawadori", label: "やすかわ通り商店街" },
    { value: "jinnya", label: "高山陣屋前交差点" },
    { value: "nakabashi", label: "中橋" },
  ];

  const handleLocationChangeLocal = (event) => {
    handleLocationChange(event.target.value);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      alignItems: isMobile ? 'stretch' : 'center', 
      gap: isScrolled ? (isMobile ? 0.5 : 0.6) : (isMobile ? 0.8 : 1.0) 
    }}>
      <Typography 
        variant="labelL" 
        sx={{ 
          color: theme.palette.text.white, 
          fontWeight: 'bold',
          textAlign: 'left',
          fontSize: isScrolled ? (isMobile ? '0.7rem' : '0.85rem') : (isMobile ? '0.85rem' : '0.95rem'),
          whiteSpace: 'nowrap',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        計測場所
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        gap: isMobile ? 0.8 : 0.8, 
        alignItems: 'center', 
        width: isMobile ? '100%' : 'auto' 
      }}>
        {/* 計測場所選択 */}
        <FormControl variant="outlined" sx={{ 
          width: 220,
          '& .MuiOutlinedInput-root': {
            height: isScrolled ? (isMobile ? '28px' : '36px') : (isMobile ? '32px' : '40px'),
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          position: 'relative'
        }}>
          <Tooltip title="計測場所を選択">
            <Select
              value={selectedLocation || ''}
              onChange={handleLocationChangeLocal}
              disabled={loading || locationChanging}
              displayEmpty
              renderValue={(value) => {
                if (value === "") return "場所未選択";
                const selectedLoc = locationItems.find((item) => item.value === value);
                return selectedLoc ? selectedLoc.label : "";
              }}
              endAdornment={
                locationChanging ? (
                  <CircularProgress 
                    size={16} 
                    sx={{ 
                      marginRight: 2,
                      color: theme.palette.primary.main
                    }} 
                  />
                ) : null
              }
              sx={{
                backgroundColor: (loading || locationChanging) ? 'rgba(255, 255, 255, 0.7)' : 'white',
                borderRadius: '8px',
                '.MuiSelect-icon': { 
                  color: (loading || locationChanging) ? 'rgba(0, 0, 0, 0.38)' : theme.palette.text.secondary,
                  right: isMobile ? '4px' : '8px',
                  display: locationChanging ? 'none' : 'block'
                },
                ...theme.typography.bodyM,
                padding: isMobile ? '4px 4px' : '4px 8px',
                '& .MuiOutlinedInput-input': {
                  padding: isMobile ? '4px 4px 4px 8px' : isSmallDesktop ? '4px 4px' : '4px 8px',
                },
                color: selectedLocation === "" ? theme.palette.text.secondary : theme.palette.text.primary,
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                fontWeight: 500
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    borderRadius: '8px',
                    marginTop: '8px'
                  }
                }
              }}
            >
              {locationItems.map((item) => (
                <MenuItem 
                  key={item.value} 
                  value={item.value} 
                  sx={{
                    ...theme.typography.bodyM,
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    minHeight: isMobile ? '40px' : '48px'
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </Tooltip>
          
          {/* ローディングオーバーレイ */}
          {locationChanging && (
            <Box 
              className="loading-overlay" 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '8px', 
                zIndex: 2 
              }}
            >
              <CircularProgress size={20} />
            </Box>
          )}
        </FormControl>

        {/* カメラの設置場所ボタン */}
        <Button
          variant="outlined"
          size="small"
          onClick={onCameraButtonClick}
          sx={{
            backgroundColor: 'transparent',
            color: 'white',
            borderColor: 'white',
            borderWidth: '2px',
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            fontWeight: 600,
            padding: isMobile ? '4px 8px' : '6px 10px',
            height: isScrolled ? (isMobile ? '28px' : '36px') : (isMobile ? '32px' : '40px'),
            minWidth: isMobile ? '100px' : '120px',
            whiteSpace: 'nowrap',
            borderRadius: '20px',
            boxShadow: '0 2px 4px rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'white',
              color: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          {'カメラの設置場所を見る'}
        </Button>
      </Box>
    </Box>
  );
}

LocationSelect.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  isScrolled: PropTypes.bool.isRequired,
  isSmallDesktop: PropTypes.bool.isRequired,
  selectedLocation: PropTypes.string,
  handleLocationChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  locationChanging: PropTypes.bool.isRequired,
  onCameraButtonClick: PropTypes.func.isRequired,
};

export default LocationSelect;
