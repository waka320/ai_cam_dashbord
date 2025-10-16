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
  Card,
  CardContent,
  Divider,
  useMediaQuery
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useCalendar } from '../../contexts/CalendarContext';
import theme from '../../theme/theme';

function EventEffect() {
  const { selectedLocation, selectedYear, selectedMonth } = useCalendar();
  const [selectedDay, setSelectedDay] = useState('');
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');

  // 月の日数を取得
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

  // 混雑度に応じた色を返す
  const getCongestionColor = (congestion) => {
    if (congestion === 0) return '#e0e0e0';
    const colors = [
      '#4CAF50', // 1
      '#8BC34A', // 2
      '#CDDC39', // 3
      '#FFEB3B', // 4
      '#FFC107', // 5
      '#FF9800', // 6
      '#FF5722', // 7
      '#F44336', // 8
      '#E91E63', // 9
      '#9C27B0'  // 10
    ];
    return colors[congestion - 1] || '#e0e0e0';
  };

  // 増加率に応じた色を返す
  const getIncreaseRateColor = (rate) => {
    if (rate > 10) return '#4CAF50';
    if (rate > 0) return '#8BC34A';
    if (rate > -10) return '#FFC107';
    return '#F44336';
  };

  // 時間別データを表示するコンポーネント
  const HourlyDataDisplay = ({ title, date, data, showIncreaseRate = false, increaseRates = [] }) => (
    <Card sx={{ mb: 2, borderRadius: '12px' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
          {date}
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1 
        }}>
          {data.map((hourData, index) => {
            const increaseRate = showIncreaseRate ? increaseRates[index]?.increase_rate : null;
            return (
              <Box
                key={hourData.hour}
                sx={{
                  flex: isMobile ? '0 0 calc(50% - 4px)' : '0 0 calc(16.666% - 7px)',
                  minWidth: isMobile ? 'calc(50% - 4px)' : '120px',
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: getCongestionColor(hourData.congestion),
                  textAlign: 'center',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {hourData.hour}時
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {hourData.count.toLocaleString()}人
                </Typography>
                {showIncreaseRate && increaseRate !== null && (
                  <Box
                    sx={{
                      mt: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getIncreaseRateColor(increaseRate)
                    }}
                  >
                    {increaseRate > 0 ? (
                      <TrendingUpIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                      {increaseRate > 0 ? '+' : ''}{increaseRate.toFixed(1)}%
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );

  HourlyDataDisplay.propTypes = {
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      hour: PropTypes.number.isRequired,
      count: PropTypes.number.isRequired,
      congestion: PropTypes.number.isRequired
    })).isRequired,
    showIncreaseRate: PropTypes.bool,
    increaseRates: PropTypes.arrayOf(PropTypes.shape({
      hour: PropTypes.number,
      increase_rate: PropTypes.number
    }))
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: '12px' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
          イベント効果分析
        </Typography>

        {/* 日付選択 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
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
            {/* サマリー情報 */}
            <Card sx={{ mb: 3, borderRadius: '12px', backgroundColor: theme.palette.primary.light + '10' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  全体サマリー
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2 
                }}>
                  <Box sx={{ flex: isMobile ? '0 0 100%' : '1 1 calc(25% - 12px)', minWidth: isMobile ? '100%' : '150px' }}>
                    <Typography variant="caption" color="text.secondary">
                      イベント当日合計
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {eventData.summary?.event_total?.toLocaleString() || 0}人
                    </Typography>
                  </Box>
                  <Box sx={{ flex: isMobile ? '0 0 100%' : '1 1 calc(25% - 12px)', minWidth: isMobile ? '100%' : '150px' }}>
                    <Typography variant="caption" color="text.secondary">
                      前週・翌週平均
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {eventData.summary?.average_total?.toLocaleString() || 0}人
                    </Typography>
                  </Box>
                  <Box sx={{ flex: isMobile ? '0 0 100%' : '1 1 calc(25% - 12px)', minWidth: isMobile ? '100%' : '150px' }}>
                    <Typography variant="caption" color="text.secondary">
                      増加人数
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {((eventData.summary?.event_total || 0) - (eventData.summary?.average_total || 0)).toLocaleString()}人
                    </Typography>
                  </Box>
                  <Box sx={{ flex: isMobile ? '0 0 100%' : '1 1 calc(25% - 12px)', minWidth: isMobile ? '100%' : '150px' }}>
                    <Typography variant="caption" color="text.secondary">
                      増加率
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: getIncreaseRateColor(eventData.summary?.total_increase_rate || 0)
                      }}
                    >
                      {(eventData.summary?.total_increase_rate || 0) > 0 ? '+' : ''}
                      {(eventData.summary?.total_increase_rate || 0).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Divider sx={{ my: 3 }} />

            {/* 時間別データ表示 */}
            <HourlyDataDisplay
              title="イベント当日"
              date={eventData.event_date}
              data={eventData.event_hourly}
              showIncreaseRate={true}
              increaseRates={eventData.increase_rates || []}
            />

            <HourlyDataDisplay
              title="前週同曜日 (-7日)"
              date={eventData.prev_week_date}
              data={eventData.prev_week_hourly}
            />

            <HourlyDataDisplay
              title="翌週同曜日 (+7日)"
              date={eventData.next_week_date}
              data={eventData.next_week_hourly}
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

