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

function EventEffect() {
  const { selectedLocation, selectedYear, selectedMonth } = useCalendar();
  const { getCellColor, getTextColor } = useColorPalette();
  const [selectedDay, setSelectedDay] = useState('');
  const [eventData, setEventData] = useState(null);
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
  // スクロール連動のためのRefs
  const headerRef1 = React.useRef(null);
  const rowRef1 = React.useRef(null);
  const headerRef2 = React.useRef(null);
  const rowRef2 = React.useRef(null);
  const headerRef3 = React.useRef(null);
  const rowRef3 = React.useRef(null);

  const syncScroll = (source, targets) => {
    if (!source?.current) return;
    const left = source.current.scrollLeft;
    targets.forEach(t => { if (t?.current && t.current.scrollLeft !== left) t.current.scrollLeft = left; });
  };

  const HourlyDataDisplay = ({ title, date, data, headerRef, rowRef, onScrollSync }) => (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant={isMobile ? 'bodyM' : 'h6'} sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant={isMobile ? 'caption' : 'body2'} sx={{ color: '#555' }}>
          {date}
        </Typography>
      </Box>
      <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', width: '100%' }}>
        {/* スクロール領域（ヘッダー+1行） */}
        <Box ref={headerRef} onScroll={onScrollSync} sx={{ 
          overflowX: 'auto', 
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { height: '8px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' }
        }}>
          {/* 時間ヘッダー */}
          <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5' }}>
            {Array.from({ length: 16 }, (_, i) => i + 7).map((hour, _, arr) => (
              <Box 
                key={`hour-head-${hour}`} 
                sx={{ 
                  minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                  width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                  textAlign: 'center', 
                  padding: isMobile ? '4px 2px' : '6px 2px',
                  borderRight: hour !== arr[arr.length - 1] ? '1px solid #ddd' : 'none',
                  borderBottom: '1px solid #ddd',
                  flexShrink: 0,
                  height: isMobile ? (isSmallMobile ? '40px' : '44px') : '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant={isSmallMobile ? 'bodyS' : 'bodyM'} fontWeight="bold">
                  {hour}
                </Typography>
              </Box>
            ))}
          </Box>
          {/* 1日の行（セル色＝混雑度、テキスト色もパレットに準拠） */}
          <Box ref={rowRef} onScroll={onScrollSync} sx={{ display: 'flex', flexDirection: 'row', overflowX: 'auto' }}>
            {Array.from({ length: 16 }, (_, i) => i + 7).map((hour, colIndex, arr) => {
              const hourItem = data.find(h => h.hour === hour) || { hour, count: 0, congestion: 0 };
              const congestion = hourItem.congestion || 0;
              const bg = congestion === 0 ? '#e0e0e0' : getCellColor(congestion);
              const fg = congestion === 0 ? '#666' : getTextColor(congestion);
              return (
                <Box 
                  key={`hour-cell-${hour}`} 
                  sx={{ 
                    minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                    width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                    height: isMobile ? (isSmallMobile ? '48px' : '54px') : '56px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: bg,
                    borderRight: colIndex !== arr.length - 1 ? '1px solid #ddd' : 'none',
                    flexShrink: 0
                  }}
                  title={`${hour}時`}
                >
                  <Typography sx={{ fontSize: isMobile ? (isSmallMobile ? '1rem' : '1.1rem') : '1.15rem', fontWeight: 800, lineHeight: 1, color: fg }}>
                    {congestion === 0 ? '-' : congestion}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  HourlyDataDisplay.propTypes = {
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      hour: PropTypes.number.isRequired,
      count: PropTypes.number.isRequired,
      congestion: PropTypes.number.isRequired
    })).isRequired,
    headerRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({ current: PropTypes.any })
    ]),
    rowRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({ current: PropTypes.any })
    ]),
    onScrollSync: PropTypes.func
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
              headerRef={headerRef1}
              rowRef={rowRef1}
              onScrollSync={() => syncScroll(rowRef1, [rowRef2, rowRef3])}
            />

            <HourlyDataDisplay
              title="前週同曜日 (-7日)"
              date={eventData.prev_week_date}
              data={eventData.prev_week_hourly}
              headerRef={headerRef2}
              rowRef={rowRef2}
              onScrollSync={() => syncScroll(rowRef2, [rowRef1, rowRef3])}
            />

            <HourlyDataDisplay
              title="翌週同曜日 (+7日)"
              date={eventData.next_week_date}
              data={eventData.next_week_hourly}
              headerRef={headerRef3}
              rowRef={rowRef3}
              onScrollSync={() => syncScroll(rowRef3, [rowRef1, rowRef2])}
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

