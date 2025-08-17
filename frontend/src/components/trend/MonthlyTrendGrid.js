import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, useMediaQuery, LinearProgress } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import { useCalendar } from '../../contexts/CalendarContext';
import AnalysisInfoButton from '../ui/AnalysisInfoButton';
import CongestionLegend from '../common/CongestionLegend';

function MonthlyTrendGrid({ data, loading, isMobile }) {
  const { getCellColor, getTextColor } = useColorPalette();
  const { selectedLocation, shouldShowCalculationNote, eventData } = useCalendar();
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  // 場所名の取得（ファイル名部分のみ）
  const getPlaceName = () => {
    if (!selectedLocation) return 'default';
    const parts = selectedLocation.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.csv', '');
  };

  // 指定年月のイベント情報を取得
  const getEventsForMonth = (year, month) => {
    if (!eventData || !Array.isArray(eventData)) return [];
    
    try {
      return eventData.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month - 1;
      });
    } catch (error) {
      console.error('Error in getEventsForMonth:', error);
      return [];
    }
  };

  // データを年×月のマトリックス形式に変換
  const organizeDataForHeatmap = (rawData) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return { years: [], months: [], matrix: {} };
    }

    // 年と月の一覧を取得
    const yearsSet = new Set();
    const monthsSet = new Set();
    const dataMap = {};

    rawData.forEach(item => {
      yearsSet.add(item.year);
      monthsSet.add(item.month);
      const key = `${item.year}-${item.month}`;
      dataMap[key] = item;
    });

    const years = Array.from(yearsSet).sort((a, b) => b - a); // 降順（新しい順）
    const months = Array.from(monthsSet).sort((a, b) => a - b);

    return { years, months, matrix: dataMap };
  };

  if (loading) {
    return (
      <Box sx={{ 
        maxWidth: '100%', 
        margin: '0 auto', 
        mt: 2, 
        px: isMobile ? 0.5 : 1 /* パディング削減 */
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            月ごとの混雑度傾向
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '200px',
          flexDirection: 'column',
          gap: 2,
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
        }}>
          <CircularProgress 
            size={48}
            thickness={4}
            sx={{ color: '#383947' }}
          />
          <Typography variant="h6" color="primary" fontWeight="bold">
            データを読み込み中...
          </Typography>

          <Box sx={{ width: '300px', mt: 1 }}>
            <LinearProgress 
              variant="indeterminate"
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  backgroundColor: '#383947',
                }
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  // データをマトリックス形式に変換
  const { years, months, matrix } = organizeDataForHeatmap(data);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ 
        maxWidth: '100%', 
        margin: '0 auto', 
        mt: 2, 
        px: isMobile ? 0.5 : 1 /* パディング削減 */
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            月ごとの混雑度傾向
          </Typography>
          <AnalysisInfoButton 
            analysisType="monthTrend"
            place={getPlaceName()}
          />
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '200px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          p: 3
        }}>
          <Typography variant="body1" color="text.secondary">
            月ごとのデータがありません
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: '100%', 
      margin: '0 auto', 
      mt: 2, 
      px: isMobile ? 1 : 2
    }}>
      {/* ヘッダー部分 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          sx={{ textAlign: isMobile ? 'center' : 'left' }}
        >
          月ごとの混雑度傾向
        </Typography>
        
        <AnalysisInfoButton 
          analysisType="monthTrend"
          place={getPlaceName()}
        />
      </Box>

      {/* ヒートマップ形式のコンテナ */}
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
          {/* 年ラベル列 - 垂直方向に固定 */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            width: isMobile ? '30px' : '45px', 
            minWidth: isMobile ? '30px' : '45px',
            position: 'sticky',
            left: 0,
            zIndex: 2,
            boxShadow: '2px 0 4px rgba(0,0,0,0.05)'
          }}>
            {/* 左上角（年ヘッダー） */}
            <Box sx={{ 
              borderRight: '1px solid #ddd',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: isMobile ? '1px 0' : '2px 1px',
              backgroundColor: '#f5f5f5',
              height: isMobile ? (isSmallMobile ? '45px' : '50px') : '50px',
            }}>
              <Typography 
                variant={isSmallMobile ? "bodyS" : "bodyM"} 
                fontWeight="bold"
              >
               
              </Typography>
            </Box>

            {/* 年ラベル */}
            {years.map((year, rowIndex) => (
              <Box 
                key={`year-label-${year}`}
                sx={{ 
                  borderRight: '1px solid #ddd',
                  borderBottom: rowIndex !== years.length - 1 ? '1px solid #ddd' : 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: isMobile ? '0' : '1px 0',
                  backgroundColor: '#f9f9f9',
                  height: isMobile ? (isSmallMobile ? '45px' : '50px') : '50px',
                }}
              >
                <Typography 
                  variant={isSmallMobile ? "bodyS" : "bodyM"} 
                  fontWeight="bold"
                  sx={{
                    fontSize: isMobile ? '9px' : '11px',
                    lineHeight: 0.9
                  }}
                >
                  {year}
                </Typography>
              </Box>
            ))}
          </Box>
          
          {/* セルとヘッダーのスクロール可能なエリア */}
          <Box sx={{ 
            overflowX: 'auto',
            overflowY: 'hidden',
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
            {/* 月ヘッダー */}
            <Box sx={{ 
              display: 'flex',
              backgroundColor: '#f5f5f5',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            }}>
              {months.map(month => (
                <Box 
                  key={`month-${month}`} 
                  sx={{ 
                    minWidth: isMobile ? (isSmallMobile ? '28px' : '35px') : '50px',
                    width: isMobile ? (isSmallMobile ? '28px' : '35px') : '50px',
                    textAlign: 'center', 
                    padding: isMobile ? '1px 0' : '2px 1px',
                    borderRight: month !== months[months.length - 1] ? '1px solid #ddd' : 'none',
                    borderBottom: '1px solid #ddd',
                    flexShrink: 0,
                    height: isMobile ? (isSmallMobile ? '45px' : '50px') : '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography 
                    variant={isSmallMobile ? "bodyM" : "h6"}
                    fontWeight="bold"
                    sx={{
                      fontSize: isMobile ? (isSmallMobile ? '12px' : '14px') : '11px',
                      lineHeight: 0.9
                    }}
                  >
                    {month}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* 年ごとのセル（行） */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {years.map((year, rowIndex) => (
                <Box 
                  key={`year-row-${year}`} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'row'
                  }}
                >
                  {/* 月ごとのセル */}
                  {months.map((month, colIndex) => {
                    const cellData = matrix[`${year}-${month}`];
                    const congestion = cellData ? cellData.congestion : 0;
                    const totalCount = cellData ? cellData.total_count : 0;
                    const events = getEventsForMonth(year, month);
                    const hasEvents = events.length > 0;
                    const baseHeight = isMobile ? (isSmallMobile ? 45 : 50) : 50;
                    const eventHeight = hasEvents ? (isMobile ? 12 : 14) : 0;
                    const totalHeight = baseHeight + eventHeight;
                    
                    return (
                      <Box 
                        key={`${year}-${month}`}
                        sx={{ 
                          minWidth: isMobile ? (isSmallMobile ? '28px' : '35px') : '50px',
                          width: isMobile ? (isSmallMobile ? '28px' : '35px') : '50px',
                          height: `${totalHeight}px`,
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: congestion === 0 ? '#e0e0e0' : getCellColor(congestion),
                          borderRight: colIndex !== months.length - 1 ? '1px solid #ddd' : 'none',
                          borderBottom: rowIndex !== years.length - 1 ? '1px solid #ddd' : 'none',
                          position: 'relative',
                          cursor: 'default',
                          flexShrink: 0,
                          justifyContent: 'flex-start',
                          alignItems: 'center'
                        }}
                        title={`${year}年${month}月 ${congestion === 0 ? '(データなし)' : `混雑度: ${congestion} (人数: ${totalCount})`}${hasEvents ? `\nイベント: ${events.map(e => e.title).join(', ')}` : ''}`}
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
                            sx={{ 
                              fontSize: isMobile ? (isSmallMobile ? '18px' : '20px') : '22px',
                              lineHeight: '1',
                              fontWeight: 'bold',
                              textAlign: 'center'
                            }}
                          >
                            {congestion === 0 ? '-' : congestion}
                          </Typography>
                        </Box>
                        
                        {/* イベント情報エリア */}
                        {hasEvents && (
                          <Box sx={{
                            width: '100%',
                            minHeight: isMobile ? '12px' : '14px',
                            backgroundColor: 'rgba(255, 255, 255, 0.75)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1px 2px',
                            overflow: 'visible'
                          }}>
                            <Typography 
                              sx={{ 
                                fontSize: isMobile ? '7px' : '8px',
                                color: '#333',
                                fontWeight: '600',
                                lineHeight: '1.1',
                                textAlign: 'center',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                hyphens: 'auto',
                                maxWidth: '100%'
                              }}
                              title={events.map(e => e.title).join(', ')}
                            >
                              {events.length > 3 ? `${events.length}件` : 
                                events.map((event, eventIndex) => (
                                  <span key={eventIndex}>
                                    {event.title.substring(0, 2)}
                                    {eventIndex < events.length - 1 && <br />}
                                  </span>
                                ))
                              }
                            </Typography>
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

      {/* レジェンド */}
      <Box sx={{ mt: 2 }}>
        <CongestionLegend 
          showCalculationNote={shouldShowCalculationNote()} 
          legendType="trend" 
        />
      </Box>
    </Box>
  );
}

MonthlyTrendGrid.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    congestion: PropTypes.number.isRequired,
    total_count: PropTypes.number,
    highlighted: PropTypes.bool,
    highlight_reason: PropTypes.string,
    weather_info: PropTypes.object,
  })),
  loading: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default MonthlyTrendGrid;
