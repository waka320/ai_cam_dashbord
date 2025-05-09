import React, { useState } from 'react';
import { 
  Box, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel, 
  Typography,
  Paper,
  Tooltip,
  IconButton,
  Collapse,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PaletteIcon from '@mui/icons-material/Palette';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import theme from '../../theme/theme';

const ColorPaletteSwitcher = () => {
  const { currentPalette, changePalette, availablePalettes } = useColorPalette();
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // 展開/折りたたみ状態を管理するステート
  const [expanded, setExpanded] = useState(false);
  
  const handleChange = (event) => {
    changePalette(event.target.value);
  };
  
  // 展開/折りたたみの切り替え
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Paper 
      elevation={1}
      sx={{ 
        p: isMobile ? 1.5 : 2,
        mb: 2, 
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PaletteIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <FormLabel 
            component="legend"
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 0
            }}
          >
            カラーパレット選択
          </FormLabel>
        </Box>
        
        {/* 現在選択されているパレットのプレビュー（折りたたみ時も表示） */}
        {!expanded && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            ml: 2,
            flexGrow: 1,
            overflow: 'hidden'
          }}>
            <Typography variant="body2" sx={{ mr: 1, whiteSpace: 'nowrap' }}>
              現在: {availablePalettes.find(p => p.id === currentPalette)?.name}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              height: '1.2rem',
              borderRadius: '4px',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {availablePalettes.find(p => p.id === currentPalette)?.sample.map((color, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    width: isMobile ? '0.6rem' : '0.8rem', 
                    height: '100%', 
                    backgroundColor: color
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* 展開/折りたたみボタン */}
        <IconButton 
          onClick={toggleExpand}
          size="small"
          sx={{ color: theme.palette.primary.main }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      {/* 展開時のみ表示されるパレット選択オプション */}
      <Collapse in={expanded} timeout="auto">
        <Box sx={{ mt: 2 }}>
          <FormControl component="fieldset">
            <RadioGroup 
              row={!isMobile} 
              value={currentPalette} 
              onChange={handleChange} 
              name="color-palette-group"
              sx={{
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              {availablePalettes.map(palette => (
                <FormControlLabel 
                  key={palette.id}
                  value={palette.id}
                  control={
                    <Radio 
                      sx={{
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 1
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mr: isMobile ? 0 : 1,
                          fontSize: isMobile ? '0.8rem' : '0.9rem',
                          fontWeight: currentPalette === palette.id ? 'bold' : 'normal'
                        }}
                      >
                        {palette.name}
                      </Typography>
                      <Tooltip title="パレットサンプル">
                        <Box sx={{ 
                          display: 'flex', 
                          height: '1.5rem',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          boxShadow: currentPalette === palette.id ? '0 0 0 2px rgba(25, 118, 210, 0.5)' : 'none'
                        }}>
                          {palette.sample.map((color, index) => {
                            const congestionLevel = index + 1;
                            
                            // テキスト色の判定ロジックを修正
                            let textColor;
                            if (palette.inverted) {
                              // 反転パターン
                              textColor = congestionLevel < palette.textThreshold ? 'white' : 'black';
                            } else {
                              // 通常パターン
                              textColor = congestionLevel >= palette.textThreshold ? 'white' : 'black';
                            }
                            
                            return (
                              <Box 
                                key={index}
                                sx={{ 
                                  width: isMobile ? '0.8rem' : '1rem', 
                                  height: '100%', 
                                  backgroundColor: color,
                                  color: textColor,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.5rem'
                                }}
                              >
                                {congestionLevel}
                              </Box>
                            );
                          })}
                        </Box>
                      </Tooltip>
                    </Box>
                  }
                  sx={{
                    margin: isMobile ? '4px 0' : '0 8px 0 0'
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ColorPaletteSwitcher;
