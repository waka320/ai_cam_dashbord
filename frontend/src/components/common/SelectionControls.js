import React, { useMemo } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, useMediaQuery } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useCalendar } from '../../contexts/CalendarContext';

const SelectionControls = () => {
  const {
    selectedLocation,
    setSelectedLocation,
    selectedAction,
    setSelectedAction,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    resetSelections,
    updateMonthAndFetch
  } = useCalendar();
  
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // 場所の選択肢 - 実際の環境に合わせてカスタマイズすること
  const locations = [
    { value: 'place1', label: '場所1' },
    { value: 'place2', label: '場所2' },
    { value: 'place3', label: '場所3' },
  ];
  
  // アクションの選択肢
  const actions = [
    { value: 'cal1', label: 'カレンダー表示' },
    { value: 'wti1', label: '曜日×時間帯' },
    { value: 'dti1', label: '日付×時間帯' },
  ];
  
  // 年の選択肢 - 現在の年を中心に動的に生成
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1].map(year => ({
      value: year.toString(),
      label: `${year}年`
    }));
  }, []);
  
  // 月の選択肢
  const months = Array.from({length: 12}, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1}月`
  }));

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    
    // 年が変更されたら、その年と現在の月のデータを取得
    if (selectedLocation && selectedAction && selectedMonth) {
      setTimeout(() => {
        updateMonthAndFetch(parseInt(newYear), parseInt(selectedMonth));
      }, 50);
    }
  };
  
  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    
    // 月が変更されたら、現在の年とその月のデータを取得
    if (selectedLocation && selectedAction && selectedYear) {
      setTimeout(() => {
        updateMonthAndFetch(parseInt(selectedYear), parseInt(newMonth));
      }, 50);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 2,
      mb: 3,
      alignItems: 'flex-end'
    }}>
      <FormControl sx={{ minWidth: 120, flex: 1 }}>
        <InputLabel>場所</InputLabel>
        <Select
          value={selectedLocation}
          label="場所"
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          {locations.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl sx={{ minWidth: 150, flex: 1 }}>
        <InputLabel>表示タイプ</InputLabel>
        <Select
          value={selectedAction}
          label="表示タイプ"
          onChange={(e) => setSelectedAction(e.target.value)}
        >
          {actions.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl sx={{ minWidth: 100, flex: 1 }}>
        <InputLabel>年</InputLabel>
        <Select
          value={selectedYear}
          label="年"
          onChange={handleYearChange}
        >
          {years.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl sx={{ minWidth: 100, flex: 1 }}>
        <InputLabel>月</InputLabel>
        <Select
          value={selectedMonth}
          label="月"
          onChange={handleMonthChange}
        >
          {months.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Button
        variant="outlined"
        startIcon={<RestartAltIcon />}
        onClick={resetSelections}
        sx={{ height: isMobile ? 'auto' : '56px' }}
      >
        リセット
      </Button>
    </Box>
  );
};

export default SelectionControls;
