import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  useMediaQuery
} from '@mui/material';
import { useCalendar } from '../../contexts/CalendarContext';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import WeatherIcon from '../ui/WeatherIcon';

function EventEffect() {
  const { selectedLocation, selectedYear, selectedMonth } = useCalendar();
  const { getCellColor, getTextColor } = useColorPalette();
  const [selectedDay, setSelectedDay] = useState('');
  const [eventData, setEventData] = useState(null);
  const [monthlyEvents, setMonthlyEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  // 月の日数を取得（機能優先・モバイル優先のためシンプルに）
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const fetchEventEffectData = React.useCallback(async () => {
    if (!selectedLocation || !selectedYear || !selectedMonth || !selectedDay) {
      console.log('EventEffect: Missing parameters, skipping fetch', {
        location: selectedLocation,
        year: selectedYear,
        month: selectedMonth,
        day: selectedDay
      });
      return;
    }

    console.log('EventEffect: Fetching data with params:', {
      place: selectedLocation,
      year: parseInt(selectedYear),
      month: parseInt(selectedMonth),
      day: parseInt(selectedDay),
      action: 'event_effect'
    });

    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/'; // eslint-disable-line no-undef
      const response = await fetch(`${baseUrl}api/get-graph`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          place: selectedLocation,
          year: parseInt(selectedYear),
          month: parseInt(selectedMonth),
          day: parseInt(selectedDay),
          action: 'event_effect'
        }),
      });

      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const result = await response.json();
      console.log('EventEffect: Data received:', result.data);
      setEventData(result.data);
      setMonthlyEvents(result.event_data || []);
    } catch (err) {
      setError(err.message);
      console.error('EventEffect: Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedYear, selectedMonth, selectedDay]);

  // 日付が選択されたときにデータを取得
  useEffect(() => {
    if (selectedLocation && selectedYear && selectedMonth && selectedDay) {
      fetchEventEffectData();
    }
  }, [selectedLocation, selectedYear, selectedMonth, selectedDay, fetchEventEffectData]);

  const handleDayChange = (event) => {
    const newDay = event.target.value;
    console.log('EventEffect: Day selected:', newDay);
    setSelectedDay(newDay);
  };

  // 増加率の色（必要最小限）
  const getIncreaseRateColor = (rate) => {
    if (rate > 0) return '#2e7d32';
    if (rate < 0) return '#c62828';
    return '#555';
  };

  // 時間別データを表示するコンポーネント
  // スクロール連動のためのRefs（TodayDetails.jsと同じパターン）
  const scrollRef1 = React.useRef(null);
  const scrollRef2 = React.useRef(null);
  const scrollRef3 = React.useRef(null);

  // TodayDetails.jsと同じhandleScrollパターン
  const handleScroll = (sourceRef, targetRefs) => {
    if (!sourceRef.current) return;
    
    const scrollLeft = sourceRef.current.scrollLeft;
    targetRefs.forEach(targetRef => {
      if (targetRef.current && targetRef !== sourceRef) {
        targetRef.current.scrollLeft = scrollLeft;
      }
    });
  };

  const HourlyDataDisplay = ({ title, date, data, scrollRef, onScrollSync, monthlyEvents }) => {
    // 日付を日本語形式に変換（例: 2025年7月10日（木））
    const formatDateJapanese = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
      return `${year}年${month}月${day}日(${dayOfWeek})`;
    };

    return (
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant={isMobile ? 'bodyM' : 'h6'} sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant={isMobile ? 'caption' : 'body2'} sx={{ color: '#555' }}>
            {formatDateJapanese(date)}
          </Typography>
        </Box>
      <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', width: '100%' }}>
        {/* スクロール領域（ヘッダー+1行） */}
        <Box sx={{ display: 'flex', position: 'relative' }}>
          {/* 左側の日付・天気カラム（固定） */}
          <Box sx={{ 
            display: 'flex', flexDirection: 'column',
            width: isMobile ? '60px' : '70px', minWidth: isMobile ? '60px' : '70px',
            borderRight: '1px solid #ddd', backgroundColor: '#f9f9f9'
          }}>
            {/* 左上角の見出し */}
            <Box sx={{ 
              borderBottom: '1px solid #ddd',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              height: isMobile ? (isSmallMobile ? '40px' : '44px') : '46px',
              padding: isMobile ? '4px 2px' : '6px 2px'
            }}>
              <Typography variant={isSmallMobile ? 'bodyS' : 'bodyM'} fontWeight="bold">日付</Typography>
            </Box>
            {/* 日付＋天気（1行分） */}
            <Box sx={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: isMobile ? (isSmallMobile ? '48px' : '54px') : '56px',
              position: 'relative'
            }}>
              {/* 天気（右上） */}
              {data?.[0]?.weather_info && (
                <Box sx={{ position: 'absolute', top: '2px', right: '2px', width: isSmallMobile ? '14px' : '16px', height: isSmallMobile ? '14px' : '16px' }}>
                  <WeatherIcon weather={data[0].weather_info.weather} size="small" showTemp={false} />
                </Box>
              )}
              <Typography variant={isSmallMobile ? 'bodyS' : 'bodyM'} fontWeight="bold">
                {new Date(date).getMonth() + 1}/{new Date(date).getDate()}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: isSmallMobile ? '0.55rem' : '0.65rem', opacity: 0.85, lineHeight: 1 }}>
                {['日','月','火','水','木','金','土'][new Date(date).getDay()]}
              </Typography>
            </Box>
            {/* イベント表示（DateTimeHeatmap風） */}
            {(() => {
              const eventsForDate = (monthlyEvents || []).filter(e => e.date === date);
              if (!eventsForDate.length) return null;
              return (
                <Box sx={{
                  width: '100%',
                  minHeight: isSmallMobile ? '12px' : '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.75)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '1px 2px', overflow: 'visible', borderTop: '1px solid #ddd'
                }}>
                  <Typography sx={{
                    fontSize: isSmallMobile ? '8px' : '9px', color: '#333', fontWeight: 600,
                    lineHeight: 1.1, textAlign: 'center', whiteSpace: 'normal', wordBreak: 'break-word', hyphens: 'auto', maxWidth: '100%'
                  }} title={eventsForDate.map(ev => ev.title).join(', ')}>
                    {eventsForDate.map((ev, idx) => (
                      <span key={idx}>
                        {ev.title}
                        {idx < eventsForDate.length - 1 && <br />}
                      </span>
                    ))}
                  </Typography>
                </Box>
              );
            })()}
          </Box>
          {/* 右側：ヘッダーと1行の水平スクロール領域（1つのコンテナにまとめる） */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box 
              ref={scrollRef}
              onScroll={() => onScrollSync(scrollRef)}
              sx={{ 
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                height: 'auto',
                flex: 'none',
                // スクロールバーを常に表示（モバイルでも）
                '&::-webkit-scrollbar': { 
                  height: isMobile ? '6px' : '8px',
                  width: isMobile ? '6px' : '8px'
                },
                '&::-webkit-scrollbar-track': { 
                  backgroundColor: '#f1f1f1', 
                  borderRadius: '4px' 
                },
                '&::-webkit-scrollbar-thumb': { 
                  backgroundColor: '#888', 
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#555'
                  }
                },
                // Firefox用のスクロールバー表示
                scrollbarWidth: 'thin',
                scrollbarColor: '#888 #f1f1f1'
              }}
            >
              {/* 時間ヘッダー */}
              <Box sx={{ 
                display: 'flex', 
                backgroundColor: '#f5f5f5', 
                width: 'fit-content', 
                minWidth: '100%',
                borderBottom: '1px solid #ddd'
              }}>
                {Array.from({ length: 16 }, (_, i) => i + 7).map((hour, idx, arr) => (
                  <Box key={`hour-head-${hour}`} sx={{ 
                    minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                    width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                    textAlign: 'center', 
                    padding: isMobile ? '4px 2px' : '6px 2px',
                    borderRight: idx !== arr.length - 1 ? '1px solid #ddd' : 'none',
                    flexShrink: 0,
                    height: isMobile ? (isSmallMobile ? '40px' : '44px') : '46px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <Typography variant={isSmallMobile ? 'bodyS' : 'bodyM'} fontWeight="bold">{hour}</Typography>
                  </Box>
                ))}
              </Box>
              {/* 1日の行 */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                width: 'fit-content', 
                minWidth: '100%',
                flex: 'none',
                height: 'auto'
              }}>
                {Array.from({ length: 16 }, (_, i) => i + 7).map((hour, colIndex, arr) => {
                  const hourItem = data.find(h => h.hour === hour) || { hour, count: 0, congestion: 0 };
                  const congestion = hourItem.congestion || 0;
                  const bg = congestion === 0 ? '#e0e0e0' : getCellColor(congestion);
                  const fg = congestion === 0 ? '#666' : getTextColor(congestion);
                  return (
                    <Box key={`hour-cell-${hour}`} sx={{ 
                      minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                      width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                      height: isMobile ? (isSmallMobile ? '48px' : '54px') : '56px',
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      position: 'relative',
                      backgroundColor: bg, 
                      borderRight: colIndex !== arr.length - 1 ? '1px solid #ddd' : 'none', 
                      flexShrink: 0
                    }} title={`${hour}時`}>
                      {/* 時刻ごとの天気（右上） */}
                      {hourItem.weather_info && (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: '2px', 
                          right: '2px', 
                          width: isSmallMobile ? '12px' : '14px', 
                          height: isSmallMobile ? '12px' : '14px' 
                        }}>
                          <WeatherIcon weather={hourItem.weather_info.weather} size="small" showTemp={false} />
                        </Box>
                      )}
                      <Typography sx={{ 
                        fontSize: isMobile ? (isSmallMobile ? '1rem' : '1.1rem') : '1.15rem', 
                        fontWeight: 800, 
                        lineHeight: 1, 
                        color: fg 
                      }}>
                        {congestion === 0 ? '-' : congestion}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
    );
  };

  HourlyDataDisplay.propTypes = {
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      hour: PropTypes.number.isRequired,
      count: PropTypes.number.isRequired,
      congestion: PropTypes.number.isRequired,
      weather_info: PropTypes.shape({
        weather: PropTypes.string,
        avg_temperature: PropTypes.number,
        total_rain: PropTypes.number
      })
    })).isRequired,
    scrollRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({ current: PropTypes.any })
    ]),
    onScrollSync: PropTypes.func,
    monthlyEvents: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.string,
      title: PropTypes.string
    })).isRequired
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      <Paper sx={{ p: isMobile ? 1.5 : 2, borderRadius: '10px' }}>
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ mb: 1.5, fontWeight: 700 }}>
          イベント効果分析
        </Typography>

        {/* 日付選択 */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant={isMobile ? 'bodyM' : 'body1'} sx={{ mb: 0.5, fontWeight: 600 }}>
            イベント開催日を選択してください
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300 }}>
            <Select
              value={selectedDay}
              onChange={handleDayChange}
              displayEmpty
              sx={{
                backgroundColor: 'white',
                borderRadius: '8px',
                height: isMobile ? 36 : 40,
              }}
            >
              <MenuItem value="" disabled>
                日を選択
              </MenuItem>
              {selectedYear && selectedMonth && 
                Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map(day => (
                  <MenuItem key={day} value={day}>
                    {day}日
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {eventData && !loading && eventData.event_date && eventData.event_hourly && eventData.event_hourly.length > 0 && (
          <Box>
            {/* サマリー（装飾最小・大きめ文字） */}
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ flex: isMobile ? '0 0 calc(50% - 4px)' : '1 1 calc(25% - 8px)' }}>
                  <Typography sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem', color: '#666' }}>イベント当日合計</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: isMobile ? '1.1rem' : '1.2rem' }}>
                    {eventData.summary?.event_total?.toLocaleString() || 0}人
                  </Typography>
                </Box>
                <Box sx={{ flex: isMobile ? '0 0 calc(50% - 4px)' : '1 1 calc(25% - 8px)' }}>
                  <Typography sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem', color: '#666' }}>前週・翌週平均</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: isMobile ? '1.1rem' : '1.2rem' }}>
                    {eventData.summary?.average_total?.toLocaleString() || 0}人
                  </Typography>
                </Box>
                <Box sx={{ flex: isMobile ? '0 0 calc(50% - 4px)' : '1 1 calc(25% - 8px)' }}>
                  <Typography sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem', color: '#666' }}>増加人数</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: isMobile ? '1.1rem' : '1.2rem' }}>
                    {((eventData.summary?.event_total || 0) - (eventData.summary?.average_total || 0)).toLocaleString()}人
                  </Typography>
                </Box>
                <Box sx={{ flex: isMobile ? '0 0 calc(50% - 4px)' : '1 1 calc(25% - 8px)' }}>
                  <Typography sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem', color: '#666' }}>増加率</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: isMobile ? '1.1rem' : '1.2rem', color: getIncreaseRateColor(eventData.summary?.total_increase_rate || 0) }}>
                    {(eventData.summary?.total_increase_rate || 0) > 0 ? '+' : ''}
                    {(eventData.summary?.total_increase_rate || 0).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* 時間別データ表示 */}
            <HourlyDataDisplay
              title="イベント当日"
              date={eventData.event_date}
              data={eventData.event_hourly}
              scrollRef={scrollRef1}
              onScrollSync={() => handleScroll(scrollRef1, [scrollRef2, scrollRef3])}
              monthlyEvents={monthlyEvents}
            />

            <HourlyDataDisplay
              title="前週同曜日 (-7日)"
              date={eventData.prev_week_date}
              data={eventData.prev_week_hourly}
              scrollRef={scrollRef2}
              onScrollSync={() => handleScroll(scrollRef2, [scrollRef1, scrollRef3])}
              monthlyEvents={monthlyEvents}
            />

            <HourlyDataDisplay
              title="翌週同曜日 (+7日)"
              date={eventData.next_week_date}
              data={eventData.next_week_hourly}
              scrollRef={scrollRef3}
              onScrollSync={() => handleScroll(scrollRef3, [scrollRef1, scrollRef2])}
              monthlyEvents={monthlyEvents}
            />
          </Box>
        )}

        {!selectedDay && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              イベント開催日を選択してください
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default EventEffect;

