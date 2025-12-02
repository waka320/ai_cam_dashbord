import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, useMediaQuery, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCalendar } from '../../contexts/CalendarContext';
import theme from '../../theme/theme';
import SectionContainer from '../ui/SectionContainer';

function ForeignersDistribution() {
  const { selectedYear } = useCalendar();
  const [distributionData, setDistributionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');

  // 西暦（2024など）を年度（R6など）に変換
  const convertADToYear = (adYear) => {
    if (!adYear) return null;
    const yearNum = parseInt(adYear, 10);
    if (isNaN(yearNum)) return null;
    const reiwaYear = yearNum - 2019 + 1;
    return `R${reiwaYear}`;
  };

  useEffect(() => {
    const fetchDistribution = async () => {
      // 年が選択されていない場合は何もしない
      if (!selectedYear) {
        return;
      }

      // 西暦を年度形式に変換
      const yearInReiwaFormat = convertADToYear(selectedYear);
      if (!yearInReiwaFormat) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/'; // eslint-disable-line no-undef
        const response = await fetch(
          `${baseUrl}api/foreigners/yearly-distribution?year=${encodeURIComponent(yearInReiwaFormat)}&top_n=10`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            console.warn('ForeignersDistribution: データが見つかりません');
            setDistributionData(null);
            setError(null);
            return;
          }
          throw new Error(`データの取得に失敗しました (${response.status})`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setDistributionData(result.data);
        } else {
          throw new Error('データの形式が正しくありません');
        }
      } catch (err) {
        console.error('ForeignersDistribution: Error fetching data:', err);
        setError(err.message);
        setDistributionData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
  }, [selectedYear]);

  // グラフ用の色パレット
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    '#4caf50',
    '#ff9800',
    '#9c27b0',
    '#f44336',
    '#00bcd4',
    '#795548',
    '#607d8b',
    '#e91e63',
  ];

  if (loading && !distributionData) {
    return (
      <SectionContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </Box>
      </SectionContainer>
    );
  }

  if (error) {
    return (
      <SectionContainer>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </SectionContainer>
    );
  }

  if (!selectedYear) {
    return (
      <SectionContainer>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography>年度を選択してください</Typography>
        </Box>
      </SectionContainer>
    );
  }

  if (!distributionData || !distributionData.chart_data || distributionData.chart_data.length === 0) {
    return null;
  }

  // グラフデータを準備
  const chartData = distributionData.chart_data.map(item => ({
    month: item.month_label,
    ...item,
  }));

  return (
    <SectionContainer>
      <Paper
        elevation={1}
        sx={{
          p: isMobile ? 2 : 3,
          borderRadius: '8px',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: isMobile ? '1rem' : '1.2rem',
            }}
          >
            {selectedYear}年 外国人宿泊者分布
          </Typography>
        </Box>

        {distributionData.top_countries && distributionData.top_countries.length > 0 ? (
          <Box sx={{ width: '100%', height: isMobile ? 400 : 500 }}>
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  label={{ value: '宿泊者数', angle: -90, position: 'insideLeft', fontSize: isMobile ? 10 : 12 }}
                />
                <Tooltip
                  formatter={(value) => [value.toLocaleString() + '人', '']}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: isMobile ? '0.75rem' : '0.85rem',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  iconType="line"
                />
                {distributionData.top_countries.map((country, index) => (
                  <Line
                    key={country}
                    type="monotone"
                    dataKey={country}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: isMobile ? 3 : 4 }}
                    activeDot={{ r: isMobile ? 5 : 6 }}
                    name={country}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography>データがありません</Typography>
          </Box>
        )}
      </Paper>
    </SectionContainer>
  );
}

export default ForeignersDistribution;
