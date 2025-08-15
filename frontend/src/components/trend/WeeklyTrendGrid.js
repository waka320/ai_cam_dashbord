import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import { useCalendar } from '../../contexts/CalendarContext';
import AnalysisInfoButton from '../ui/AnalysisInfoButton';
import CongestionLegend from '../common/CongestionLegend';

function WeeklyTrendGrid({ data, loading, isMobile }) {
  const { getCellColor, getTextColor } = useColorPalette();
  const { selectedLocation, shouldShowCalculationNote } = useCalendar();

  // 場所名の取得（ファイル名部分のみ）
  const getPlaceName = () => {
    if (!selectedLocation) return 'default';
    const parts = selectedLocation.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.csv', '');
  };

  // データをヒートマップ形式に変換
  const organizeDataForHeatmap = (rawData) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return { yearMonths: [], yearMonthData: {} };
    }

    // 年月ごとにデータを整理
    const yearMonthData = {};
    
    rawData.forEach(item => {
      const yearMonth = `${item.year}-${String(item.month).padStart(2, '0')}`;
      
      if (!yearMonthData[yearMonth]) {
        yearMonthData[yearMonth] = [];
      }
      
      yearMonthData[yearMonth].push({
        ...item,
        weekKey: item.start_date,
        display: item.date_range || `${item.start_date.split('-').slice(1).join('/')}~${item.end_date.split('-').slice(1).join('/')}`
      });
    });

    // 各年月内で週をソート
    Object.keys(yearMonthData).forEach(yearMonth => {
      yearMonthData[yearMonth].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
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
        px: isMobile ? 1 : 2
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
        px: isMobile ? 1 : 2
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
                      fontSize: isMobile ? '10px' : '12px',
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
                    
                    // 全ての行で5セル統一
                    const availableWidth = `calc((100% - ${isMobile ? '50px' : '60px'}) / 5)`;
                    
                    // 限界まで大きくした文字サイズ
                    const dynamicFontSize = isMobile ? 22 : 30;
                    const dynamicDateFontSize = isMobile ? 11 : 14;
                    
                    return (
                      <Box
                        key={weekData ? `week-${weekData.weekKey}` : `empty-${index}`}
                        sx={{
                          width: availableWidth,
                          height: isMobile ? '40px' : '50px',
                          backgroundColor: weekData ? getCellColor(weekData.congestion) : '#f9f9f9',
                          color: weekData ? getTextColor(weekData.congestion) : '#999',
                          borderRight: index !== 4 ? '1px solid #ddd' : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: weekData ? 'pointer' : 'default',
                          position: 'relative',
                          padding: 0,
                          flex: 1
                        }}
                        title={weekData ? `期間: ${weekData.display}\n混雑度: ${weekData.congestion}/10\n総数: ${weekData.total_count.toLocaleString()}` : 'データが不足しているため表示できません\n（7日未満の週または欠損率が高い週）'}
                      >
                        {weekData ? (
                          <>
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
    week: PropTypes.number.isRequired,
    congestion: PropTypes.number.isRequired,
    total_count: PropTypes.number,
    date_range: PropTypes.string,
    highlighted: PropTypes.bool,
    highlight_reason: PropTypes.string,
    weather_info: PropTypes.object,
  })),
  loading: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default WeeklyTrendGrid;
