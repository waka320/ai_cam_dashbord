import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import { useCalendar } from '../../contexts/CalendarContext';
import AnalysisInfoButton from '../ui/AnalysisInfoButton';
import CongestionLegend from '../common/CongestionLegend';

function WeeklyTrendGrid({ data, loading, isMobile }) {
  const { getCellColor, getTextColor } = useColorPalette();
  const { selectedLocation, shouldShowCalculationNote, eventData } = useCalendar();

  // 場所名の取得（ファイル名部分のみ）
  const getPlaceName = () => {
    if (!selectedLocation) return 'default';
    const parts = selectedLocation.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.csv', '');
  };

  // 週の期間内のイベント情報を取得
  const getEventsForWeek = (weekData) => {
    if (!eventData || !Array.isArray(eventData) || !weekData) return [];
    if (!weekData.start_date || !weekData.end_date) return [];
    
    try {
      const startDate = new Date(weekData.start_date);
      const endDate = new Date(weekData.end_date);
      
      return eventData.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });
    } catch (error) {
      console.error('Error in getEventsForWeek:', error);
      return [];
    }
  };

  // データをヒートマップ形式に変換
  const organizeDataForHeatmap = (rawData) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return { yearMonths: [], yearMonthData: {} };
    }

    // 年月ごとにデータを整理
    const yearMonthData = {};
    
    rawData.forEach(item => {
      // 必要なプロパティの存在チェック
      if (!item || typeof item.year !== 'number' || typeof item.month !== 'number') {
        console.warn('Invalid item data:', item);
        return;
      }
      
      const yearMonth = `${item.year}-${String(item.month).padStart(2, '0')}`;
      
      if (!yearMonthData[yearMonth]) {
        yearMonthData[yearMonth] = [];
      }
      
      // start_dateとend_dateの安全な処理
      let displayText = item.date_range || '';
      if (!displayText && item.start_date && item.end_date) {
        try {
          const startParts = item.start_date.split('-');
          const endParts = item.end_date.split('-');
          displayText = `${startParts.slice(1).join('/')}~${endParts.slice(1).join('/')}`;
        } catch (error) {
          console.warn('Error processing dates:', { start_date: item.start_date, end_date: item.end_date, error });
          displayText = 'データエラー';
        }
      }
      
      yearMonthData[yearMonth].push({
        ...item,
        weekKey: item.start_date || `${item.year}-${String(item.month).padStart(2, '0')}-${item.week || 1}`,
        display: displayText || `${item.year}年${item.month}月 第${item.week || 1}週`
      });
    });

    // 各年月内で週をソート
    Object.keys(yearMonthData).forEach(yearMonth => {
      yearMonthData[yearMonth].sort((a, b) => {
        // start_dateが存在する場合は日付でソート、そうでなければweek番号でソート
        if (a.start_date && b.start_date) {
          return new Date(a.start_date) - new Date(b.start_date);
        } else if (a.week && b.week) {
          return a.week - b.week;
        } else {
          // フォールバック：配列のインデックス順序を維持
          return 0;
        }
      });
    });

    // 年月を降順でソート（新しい順）
    const yearMonths = Object.keys(yearMonthData).sort().reverse();
    
    return { yearMonths, yearMonthData };
  };

  // 年月文字列を表示用にフォーマット
  const formatYearMonth = (yearMonthStr) => {
    const [year, month] = yearMonthStr.split('-');
    return `${year}年${parseInt(month)}月`;
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
            週ごとの混雑度傾向
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
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            データを読み込んでいます...
          </Typography>
          {shouldShowCalculationNote() && (
            <Box sx={{ width: '80%', maxWidth: 300 }}>
              <LinearProgress />
          </Box>
          )}
        </Box>
      </Box>
    );
  }

  // データを年月ごとに整理
  const { yearMonths, yearMonthData } = organizeDataForHeatmap(data);

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
            週ごとの混雑度傾向
          </Typography>
          <AnalysisInfoButton 
            analysisType="weekTrend"
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
            週ごとのデータがありません
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
          週ごとの混雑度傾向
        </Typography>
        
        <AnalysisInfoButton 
          analysisType="weekTrend"
          place={getPlaceName()}
        />
      </Box>

      {/* ヒートマップ形式の週表示 */}
      <Box sx={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        overflow: 'hidden',
        width: '100%'
      }}>
        {yearMonths.map((yearMonth, yearMonthIndex) => {
          const monthWeeks = yearMonthData[yearMonth] || [];
          
          if (monthWeeks.length === 0) return null;
              
              return (
            <Box key={`yearmonth-${yearMonth}`} sx={{ 
              borderBottom: yearMonthIndex !== yearMonths.length - 1 ? '1px solid #ddd' : 'none',
              mb: yearMonthIndex !== yearMonths.length - 1 ? 1 : 0
            }}>
              {/* 年月ラベル + 週セル */}
              <Box sx={{ 
                    display: 'flex',
                alignItems: 'stretch',
                minHeight: isMobile ? '40px' : '50px'
              }}>
                {/* 年月ラベル */}
                  <Box sx={{ 
                  minWidth: isMobile ? '50px' : '60px',
                  backgroundColor: '#f5f5f5',
                  borderRight: '1px solid #ddd',
                    display: 'flex',
                    flexDirection: 'column',
                  justifyContent: 'center',
                    alignItems: 'center',
                  padding: '1px'
                  }}>
                    <Typography 
                    variant={isMobile ? "body2" : "h6"}
                    fontWeight="bold"
                      sx={{
                      fontSize: '12px',
                        textAlign: 'center',
                      lineHeight: 0.9,
                      mb: 0,
                      mt: 0
                      }}
                    >
                    {formatYearMonth(yearMonth).split('年')[0]}年
                    </Typography>
                    <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    fontWeight="bold"
                      sx={{
                      fontSize: isMobile ? '16px' : '20px',
                        textAlign: 'center',
                      lineHeight: 0.9,
                      mb: 0,
                      mt: 0
                      }}
                    >
                    {formatYearMonth(yearMonth).split('年')[1]}
                    </Typography>
                </Box>

                {/* 週セル */}
                <Box sx={{ 
                  display: 'flex',
                  flex: 1,
                  gap: 0
                }}>
                  {Array.from({ length: 5 }, (_, index) => {
                    const weekData = monthWeeks[index];
                    const events = weekData ? getEventsForWeek(weekData) : [];
                    const hasEvents = events.length > 0;
                    
                    // 全ての行で5セル統一
                    const availableWidth = `calc((100% - ${isMobile ? '50px' : '60px'}) / 5)`;
                    
                    // 限界まで大きくした文字サイズ
                    const dynamicFontSize = isMobile ? 22 : 30;
                    const dynamicDateFontSize = isMobile ? 9 : 14;
                    const baseHeight = isMobile ? 40 : 50;
                    const eventHeight = hasEvents ? (isMobile ? 12 : 14) : 0;
                    const totalHeight = baseHeight + eventHeight;
                    
                    return (
                      <Box
                        key={weekData ? `week-${weekData.weekKey}` : `empty-${index}`}
                        sx={{
                          width: availableWidth,
                          height: `${totalHeight}px`,
                          backgroundColor: weekData ? getCellColor(weekData.congestion) : '#f9f9f9',
                          color: weekData ? getTextColor(weekData.congestion) : '#999',
                          borderRight: index !== 4 ? '1px solid #ddd' : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          cursor: weekData ? 'pointer' : 'default',
                          position: 'relative',
                          padding: 0,
                          flex: 1
                        }}
                        title={weekData ? `期間: ${weekData.display}\n混雑度: ${weekData.congestion}/10\n総数: ${weekData.total_count.toLocaleString()}${hasEvents ? `\nイベント: ${events.map(e => e.title).join(', ')}` : ''}` : 'データが不足しているため表示できません\n（7日未満の週または欠損率が高い週）'}
                      >
                        {weekData ? (
                          <>
                            {/* メインコンテンツエリア */}
                            <Box sx={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {/* 混雑度の数値 */}
                              <Typography 
                                variant={isMobile ? "h6" : "h5"}
                                sx={{ 
                                  fontSize: `${dynamicFontSize}px`,
                                  fontWeight: 'bold',
                                  lineHeight: 0.9,
                                  mb: 0,
                                  mt: 0
                                }}
                              >
                                {weekData.congestion}
                              </Typography>
                              
                              {/* 日付範囲（開始日〜終了日） */}
                              <Typography 
                                variant="caption"
                                sx={{ 
                                  fontSize: `${dynamicDateFontSize}px`,
                                  lineHeight: 0.9,
                                  textAlign: 'center',
                                  opacity: 0.9,
                                  whiteSpace: 'nowrap',
                                  mt: 0,
                                  mb: 0
                                }}
                              >
                                {weekData.display}
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
                                    fontSize: isMobile ? '8px' : '9px',
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
                                  {events.length > 2 ? `${events.length}件` : 
                                    events.map((event, eventIndex) => (
                                      <span key={eventIndex}>
                                        {event.title.substring(0, 3)}
                                        {eventIndex < events.length - 1 && <br />}
                                      </span>
                                    ))
                                  }
                                </Typography>
                              </Box>
                            )}
                          </>
                        ) : (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: isMobile ? '12px' : '14px',
                              color: '#ccc'
                            }}
                          >
                            -
                          </Typography>
                        )}
                </Box>
              );
            })}
          </Box>
        </Box>
            </Box>
          );
        })}
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

WeeklyTrendGrid.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    week: PropTypes.number, // オプショナルに変更
    congestion: PropTypes.number.isRequired,
    total_count: PropTypes.number,
    date_range: PropTypes.string,
    start_date: PropTypes.string, // 追加
    end_date: PropTypes.string, // 追加
    highlighted: PropTypes.bool,
    highlight_reason: PropTypes.string,
    weather_info: PropTypes.object,
  })),
  loading: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default WeeklyTrendGrid;
