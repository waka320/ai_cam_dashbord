import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress, useMediaQuery } from '@mui/material';
// import { Box, Typography, Paper, CircularProgress, useMediaQuery, Popper, ClickAwayListener } from '@mui/material';
import { useCalendar } from '../../contexts/CalendarContext';
import CongestionLegend from './CongestionLegend';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import AnalysisInfoButton from '../ui/AnalysisInfoButton'; // 追加
import WeatherIcon from '../ui/WeatherIcon'; // 追加

// 日本語の曜日名に変換する関数
const getDayNameJa = (dayName) => {
  const dayMap = {
    'Monday': '月',
    'Tuesday': '火',
    'Wednesday': '水',
    'Thursday': '木',
    'Friday': '金',
    'Saturday': '土',
    'Sunday': '日'
  };
  return dayMap[dayName] || dayName;
};

// 時間帯別ヒートマップコンポーネント
const TimeHeatmap = () => {
  const { calendarData, selectedAction, loading, selectedLocation, shouldShowCalculationNote } = useCalendar();
  const { getCellColor, getTextColor } = useColorPalette();
  
  // レスポンシブ対応のためのメディアクエリ
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  // クリックしたセルの参照とポップオーバーの状態管理
  // const [anchorEl, setAnchorEl] = useState(null);
  // const [popperText, setPopperText] = useState('');
  // const [open, setOpen] = useState(false);
  // const cellRefs = useRef({});

  // セルをタップした時の処理
  // const handleCellClick = (day, hour, highlightReason) => {
  //   const cellKey = `${day}-${hour}`;
  //   const cellElement = cellRefs.current[cellKey];
  //   
  //   if (anchorEl === cellElement) {
  //     setOpen(false);
  //     setAnchorEl(null);
  //   } else {
  //     setAnchorEl(cellElement);
  //     setPopperText(highlightReason);
  //     setOpen(true);
  //   }
  // };

  // ポップオーバー以外の場所をクリックした時に閉じる
  // const handleClickAway = () => {
  //   setOpen(false);
  // };

  // データの詳細をコンソールに出力（開発用）
  useEffect(() => {
    if (selectedAction?.startsWith('wti')) {
      console.group('TimeHeatmap データ詳細');
      console.log('選択されたアクション:', selectedAction);
      console.log('データの有無:', calendarData ? `データあり (${calendarData.length} 件)` : 'データなし');
      console.groupEnd();
    }
  }, [calendarData, selectedAction]);

  // ローディング中の表示
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // calendarDataが空の場合は何も表示しない
  if (!calendarData || calendarData.length === 0) {
    return null;
  }

  // actionが"wti"で始まる場合のみ表示
  if (!selectedAction || !(selectedAction.startsWith('wti') )) {
    return null;
  }

  // データ形式チェック
  let hasValidData = false;
  let isDtiFormat = false;
  
  try {
    // DTIデータ形式かWTIデータ形式かを検出
    if (Array.isArray(calendarData) && calendarData.length > 0) {
      const firstItem = calendarData[0];
      
      if ((firstItem.day || firstItem.date) && Array.isArray(firstItem.hours) && firstItem.hours.length > 0) {
        hasValidData = true;
        
        if (firstItem.date && (!firstItem.day || firstItem.day.includes('-'))) {
          isDtiFormat = true;
        }
      }
    }
  } catch (error) {
    console.error("Error checking data format:", error);
  }

  // DTIデータ形式の場合はコンポーネントを表示しない（DateTimeHeatmapで表示）
  if (isDtiFormat) {
    return null;
  }

  if (!hasValidData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Typography variant="body1" color="error">
          データ形式が正しくありません。別のアクションを選択してください。
        </Typography>
      </Box>
    );
  }

  // 時間の範囲を定義（7-22時）に修正
  const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7時から22時まで

  // 曜日の並び順を調整（日曜始まり）
  const orderedDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let sortedData = [];
  try {
    sortedData = [...calendarData].sort((a, b) => {
      return orderedDays.indexOf(a.day) - orderedDays.indexOf(b.day);
    });
  } catch (error) {
    console.error("Error sorting data:", error);
    sortedData = calendarData;
  }

  // 場所名の取得（ファイル名部分のみ）
  const getPlaceName = () => {
    if (!selectedLocation) return 'default';
    const parts = selectedLocation.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.csv', '');
  };

  return (
    // <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ 
        maxWidth: '100%', 
        margin: '0 auto', 
        mt: 2, 
        px: isMobile ? 1 : 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            曜日×時間帯の混雑度
          </Typography>
          
          {/* 分析情報ボタンを追加 */}
          <AnalysisInfoButton 
            analysisType="weekTime"
            place={getPlaceName()}
          />
        </Box>
        
        {/* ヘッダーとセルを分離したコンテナ */}
        <Box sx={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          overflow: 'hidden',
          width: '100%'
        }}>
          {/* スクロール可能なコンテンツエリア */}
          <Box sx={{ 
            display: 'flex',
            position: 'relative',
          }}>
            {/* 曜日ラベル列 - 垂直方向に固定 */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              width: isMobile ? '50px' : '60px', 
              minWidth: isMobile ? '50px' : '60px',
              position: 'sticky',
              left: 0,
              zIndex: 2,
              boxShadow: '2px 0 4px rgba(0,0,0,0.05)'
            }}>
              {/* 左上角（曜日ヘッダー） */}                <Box sx={{ 
                borderRight: '1px solid #ddd',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: isMobile ? '5px 2px' : '10px 5px',
                backgroundColor: '#f5f5f5',
                height: isMobile ? (isSmallMobile ? '45px' : '50px') : '50px',
              }}>
                <Typography 
                  variant={isSmallMobile ? "bodyS" : "bodyM"} 
                  fontWeight="bold"
                >
                  曜日
                </Typography>
              </Box>

              {/* 曜日ラベル */}
              {sortedData.map((dayData, rowIndex) => (
                <Box 
                  key={`day-label-${dayData.day}`}
                  sx={{ 
                    borderRight: '1px solid #ddd',
                    borderBottom: rowIndex !== sortedData.length - 1 ? '1px solid #ddd' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: isMobile ? '4px 0' : '8px 0',
                    backgroundColor: '#f9f9f9',
                    height: isMobile ? (isSmallMobile ? '45px' : '50px') : '50px',
                    position: 'relative',
                    gap: '2px'
                  }}
                >
                  <Typography 
                    variant={isSmallMobile ? "bodyS" : "bodyM"} 
                    fontWeight="bold"
                  >
                    {getDayNameJa(dayData.day)}
                  </Typography>
                  
                  {/* 曜日ラベルエリアにも天気情報を表示 */}
                  {dayData.weather_info && (
                    <WeatherIcon 
                      weather={dayData.weather_info.weather}
                      size="tiny"
                      showTemp={false}
                    />
                  )}
                </Box>
              ))}
            </Box>

            {/* セルとヘッダーのスクロール可能なエリア */}
            <Box sx={{ 
              overflowX: 'auto',
              overflowY: 'hidden', // 'auto'から'hidden'に変更
              WebkitOverflowScrolling: 'touch',
              zIndex: 1,
              '&::-webkit-scrollbar': {
                height: '8px',
                width: '8px'
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '4px'
              }
            }}>
              {/* 時間帯ヘッダー */}
              <Box sx={{ 
                display: 'flex',
                backgroundColor: '#f5f5f5',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              }}>
                {hours.map(hour => (
                  <Box 
                    key={`hour-${hour}`} 
                    sx={{ 
                      minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                      width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                      textAlign: 'center', 
                      padding: isMobile ? '4px 2px' : '6px 2px',
                      borderRight: hour !== hours[hours.length - 1] ? '1px solid #ddd' : 'none',
                      borderBottom: '1px solid #ddd',
                      flexShrink: 0,
                      height: isMobile ? (isSmallMobile ? '45px' : '50px') : '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography 
                      variant={isSmallMobile ? "bodyS" : "bodyM"}
                      fontWeight="bold"
                    >
                      {hour}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* 時間ごとのセル（行） */}
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {sortedData.map((dayData, rowIndex) => (
                  <Box 
                    key={`day-row-${dayData.day}`} 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'row'
                    }}
                  >
                    {/* 時間ごとのセル */}
                    {hours.map((hour, colIndex) => {
                      const hourData = dayData.hours.find(h => h.hour === hour);
                      const congestion = hourData ? hourData.congestion : 0;
                      // const highlighted = hourData && hourData.highlighted;
                      // const highlightReason = hourData ? hourData.highlight_reason : '';
                      // const cellKey = `${dayData.day}-${hour}`;
                      
                      return (
                        <Box 
                          key={`${dayData.day}-${hour}`}
                          // ref={(el) => cellRefs.current[cellKey] = el}
                          // onClick={() => highlighted && highlightReason ? 
                          //   handleCellClick(dayData.day, hour, highlightReason) : null}
                          sx={{ 
                            minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                            width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                            height: isMobile ? (isSmallMobile ? '45px' : '50px') : '50px',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: congestion === 0 ? '#e0e0e0' : getCellColor(congestion),
                            borderRight: colIndex !== hours.length - 1 ? '1px solid #ddd' : 'none',
                            borderBottom: rowIndex !== sortedData.length - 1 ? '1px solid #ddd' : 'none',
                            position: 'relative',
                            // cursor: highlighted ? 'pointer' : 'default',
                            cursor: 'default',
                            flexShrink: 0,
                          }}
                          // title={`${getDayNameJa(dayData.day)} ${hour}時 ${congestion === 0 ? '(データなし)' : `(混雑度: ${congestion})`}`}
                        >
                          {/* メインコンテンツエリア */}
                          <Box sx={{ 
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: congestion === 0 ? '#666' : getTextColor(congestion),
                          }}>
                            <Typography 
                              variant={isSmallMobile ? "caption" : "bodyXS"} 
                              fontWeight="bold"
                              sx={{ 
                                fontSize: isSmallMobile ? '0.65rem' : undefined
                              }}
                            >
                              {congestion === 0 ? '-' : congestion}
                            </Typography>
                          </Box>
                          
                          {/* 天気情報エリア */}
                          {hourData && hourData.weather_info && (
                            <Box sx={{
                              width: '100%',
                              height: isSmallMobile ? '12px' : '14px',
                              backgroundColor: 'rgba(255, 255, 255, 0.75)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <WeatherIcon 
                                weather={hourData.weather_info.weather}
                                size="tiny"
                                showTemp={false}
                              />
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ポッパー */}
        {/*
        <Popper 
          open={open} 
          anchorEl={anchorEl}
          placement={isMobile ? "bottom" : "top"}
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, isMobile ? 5 : 10],
              },
            },
            {
              name: 'preventOverflow',
              enabled: true,
              options: {
                boundary: document.body,
              },
            },
          ]}
          sx={{ 
            zIndex: 1500
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: isMobile ? 1.5 : 2, 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ddd',
              maxWidth: isMobile ? '180px' : '200px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              fontSize: isMobile ? (isSmallMobile ? '12px' : '14px') : undefined
            }}
          >
            <Typography variant={isMobile ? "bodyS" : "bodyM"} fontWeight="bold">
              {popperText}
            </Typography>
          </Paper>
        </Popper>
        */}

        <Box sx={{ mt: 2 }}>
          <CongestionLegend 
            showCalculationNote={shouldShowCalculationNote()} 
            legendType="heatmap" 
          />
        </Box>
      </Box>
    // </ClickAwayListener>
  );
};

export default TimeHeatmap;
