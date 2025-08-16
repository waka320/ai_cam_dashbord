import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  IconButton, 
  Popover, 
  Typography, 
  Box, 
  Divider,
  Paper,
  Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const AnalysisInfoButton = ({ analysisType, place = 'default' }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'analysis-info-popover' : undefined;

  // 場所に応じた混雑度境界値
  const getThresholds = () => {
    const thresholds = {
      'honmachi2': analysisType === 'calendar' ? [2300, 9500] : [65, 850],
      'honmachi3': analysisType === 'calendar' ? [1500, 8500] : [35, 400],
      'honmachi4': analysisType === 'calendar' ? [1000, 10000] : [50, 2000],
      'jinnya': analysisType === 'calendar' ? [700, 7000] : [50, 1000],
      'kokubunjidori': analysisType === 'calendar' ? [1600, 5800] : [40, 450],
      'nakabashi': analysisType === 'calendar' ? [1600, 7800] : [40, 650],
      'omotesando': analysisType === 'calendar' ? [700, 7000] : [25, 700],
      'yasukawadori': analysisType === 'calendar' ? [7000, 26000] : [400, 2900],
      'yottekan': analysisType === 'calendar' ? [300, 3500] : [10, 300],
      'default': analysisType === 'calendar' ? [2300, 9500] : [10, 500]
    };
    
    return thresholds[place] || thresholds['default'];
  };

  // 分析タイプに応じた情報を取得
  const getAnalysisInfo = () => {
    const thresholds = getThresholds();
    
    switch(analysisType) {
      case 'calendar':
        return {
          title: '混雑度カレンダーの計算方法',
          description: [
            `混雑度1～10は歩行者数に基づいて算出されます。`
          ],
          details: [
            `• 混雑度1-2の境界値: ${thresholds[0]}人`,
            `• 混雑度5-6の境界値: 歩行者数の平均値（0人除く）`,
            `• 混雑度9-10の境界値: ${thresholds[1]}人`
          ]
        };
      case 'dateTime':
        return {
          title: '日付×時間の混雑度の計算方法',
          description: [
            `混雑度1～10は歩行者数に基づいて算出されます。`
          ],
          details: [
            `• 混雑度1-2の境界値: ${thresholds[0]}人`,
            `• 混雑度5-6の境界値: 歩行者数の平均値（0人除く）`,
            `• 混雑度9-10の境界値: ${thresholds[1]}人`
          ]
        };
      case 'weekTime':
        return {
          title: '曜日×時間の混雑度の計算方法',
          description: [
            `混雑度1～10は歩行者数に基づいて算出されます。`,
            `各曜日・時間帯の平均値から算出しています。`
          ],
          details: [
            `• 混雑度1-2の境界値: ${thresholds[0]}人`,
            `• 混雑度5-6の境界値: 歩行者数の平均値（0人除く）`,
            `• 混雑度9-10の境界値: ${thresholds[1]}人`
          ]
        };
      default:
        return {
          title: '分析方法',
          description: ['このグラフの分析方法の詳細情報はありません。'],
          details: []
        };
    }
  };

  const info = getAnalysisInfo();

  return (
    <>
      <Tooltip title="分析方法について">
        <IconButton 
          aria-describedby={id} 
          onClick={handleClick} 
          size="small" 
          sx={{ 
            color: 'text.secondary',
            opacity: 0.7,
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff', // 明示的に白背景を指定
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <Paper sx={{ 
          p: 2, 
          maxWidth: 300,
          backgroundColor: '#ffffff',  // 明示的に白背景を指定
          color: '#333333'  // テキストの色を暗めの色に設定
        }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
            {info.title}
          </Typography>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ mb: 1.5 }}>
            {info.description.map((text, index) => (
              <Typography 
                key={index} 
                variant="body2" 
                sx={{ 
                  mb: 0.5,
                  color: '#333333'  // テキストの色を明示的に設定
                }}
              >
                {text}
              </Typography>
            ))}
          </Box>
          
          {info.details.length > 0 && (
            <>
              <Box sx={{ mt: 1 }}>
                {info.details.map((text, index) => (
                  <Typography 
                    key={index} 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.85rem',
                      mb: 0.5,
                      color: '#333333',  // テキストの色を明示的に設定
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',  // 境界値の背景をわずかに強調
                      padding: '2px 4px',
                      borderRadius: '3px'
                    }}
                  >
                    {text}
                  </Typography>
                ))}
              </Box>
            </>
          )}
        </Paper>
      </Popover>
    </>
  );
};

// PropTypesの定義
AnalysisInfoButton.propTypes = {
  analysisType: PropTypes.oneOf(['calendar', 'dateTime', 'weekTime', 'monthTrend', 'weekTrend', 'yearTrend']).isRequired,
  place: PropTypes.string
};



export default AnalysisInfoButton;
