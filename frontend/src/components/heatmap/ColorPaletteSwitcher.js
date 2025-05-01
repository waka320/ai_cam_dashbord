// src/components/heatmap/ColorPaletteSwitcher.js
import React from 'react';
import { 
  Box, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel, 
  Typography,
  Paper,
  Tooltip
} from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';

const ColorPaletteSwitcher = () => {
  const { currentPalette, changePalette, availablePalettes } = useColorPalette();
  
  const handleChange = (event) => {
    changePalette(event.target.value);
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <FormControl component="fieldset">
        <FormLabel component="legend">カラーパレット選択</FormLabel>
        <RadioGroup 
          row 
          value={currentPalette} 
          onChange={handleChange} 
          name="color-palette-group"
        >
          {availablePalettes.map(palette => (
            <FormControlLabel 
              key={palette.name}
              value={palette.name}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {palette.name}
                  </Typography>
                  <Tooltip title="パレットサンプル">
                    <Box sx={{ display: 'flex', height: '1.5rem' }}>
                      {palette.sample.map((color, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            width: '1rem', 
                            height: '100%', 
                            backgroundColor: color,
                            border: '1px solid #ddd'
                          }}
                        />
                      ))}
                    </Box>
                  </Tooltip>
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Paper>
  );
};

export default ColorPaletteSwitcher;
