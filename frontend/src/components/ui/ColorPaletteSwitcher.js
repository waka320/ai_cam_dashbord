import React, { useState } from 'react';
import { 
  Box, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  Tooltip,
  IconButton,
  Popover,
  Typography
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import { useColorPalette } from '../../contexts/ColorPaletteContext';

const ColorPaletteSwitcher = () => {
  const { currentPalette, changePalette, availablePalettes } = useColorPalette();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event) => {
    changePalette(event.target.value);
  };
  
  // 現在選択中のパレットを取得
  const selectedPalette = availablePalettes.find(palette => palette.id === currentPalette);
  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Tooltip title="カラーパレットを変更">
        <IconButton 
          onClick={handleClick}
          size="small"
          sx={{ 
            border: '1px solid rgba(0,0,0,0.12)', 
            borderRadius: '6px',
            p: 0.7,
            backgroundColor: 'rgba(255,255,255,0.8)',
            '&:hover': {
              backgroundColor: 'rgba(240, 240, 240, 0.95)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PaletteIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Box sx={{ 
              display: 'flex', 
              height: '18px',
              ml: 0.5,
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              {selectedPalette && selectedPalette.sample.slice(0, 5).map((color, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    width: '5px', 
                    height: '100%', 
                    backgroundColor: color 
                  }}
                />
              ))}
            </Box>
          </Box>
        </IconButton>
      </Tooltip>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            p: 2,
            mt: 0.5,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            maxWidth: '90vw',
            backgroundColor:'white'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          カラーパレット選択
        </Typography>
        
        <RadioGroup 
          value={currentPalette} 
          onChange={handleChange}
          name="color-palette-group"
        >
          {availablePalettes.map(palette => (
            <FormControlLabel 
              key={palette.id}
              value={palette.id}
              control={<Radio size="small" />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1, minWidth: '70px' }}>
                    {palette.name}
                  </Typography>
                  <Box sx={{ display: 'flex', height: '24px' }}>
                    {palette.sample.map((color, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          width: '16px', 
                          height: '100%', 
                          backgroundColor: color,
                          border: '1px solid rgba(0,0,0,0.12)',
                          '&:first-of-type': {
                            borderTopLeftRadius: '4px',
                            borderBottomLeftRadius: '4px'
                          },
                          '&:last-child': {
                            borderTopRightRadius: '4px',
                            borderBottomRightRadius: '4px'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              }
              sx={{ 
                mb: 0.5,
                mr: 0,
                '& .MuiFormControlLabel-label': { 
                  display: 'flex', 
                  alignItems: 'center' 
                }
              }}
            />
          ))}
        </RadioGroup>
      </Popover>
    </Box>
  );
};

export default ColorPaletteSwitcher;
