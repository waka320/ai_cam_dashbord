import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  FormControl, 
  Select, 
  MenuItem, 
  CircularProgress, 
  IconButton,
  Button,
  Tooltip
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import theme from '../../../theme/theme';

function DateSelect({ 
  isMobile, 
  isTablet, 
  isSmallDesktop, 
  isScrolled,
  selectedAction,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  loading,
  dateChanging,
  fetchCalendarData,
  updateMonthAndFetch
}) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // React Hooksは条件分岐の前に呼び出す必要がある
  const generateYearItems = () => {
    const years = [];
    const startYear = 2021;
    for (let year = startYear; year <= currentYear; year++) {
      years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
  };

  const yearItems = generateYearItems();
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    const generateMonthItems = (year) => {
      if (!year) return [];
      
      const months = [];
      const maxMonth = year === currentYear.toString() ? currentMonth : 12;
      
      for (let month = 1; month <= maxMonth; month++) {
        months.push({ value: month.toString(), label: month.toString() });
      }
      return months;
    };

    setAvailableMonths(generateMonthItems(selectedYear));
    
    const maxAvailableMonth = selectedYear === currentYear.toString() ? currentMonth.toString() : "12";
    if (selectedMonth && parseInt(selectedMonth) > parseInt(maxAvailableMonth)) {
      setSelectedMonth("");
    }
  }, [selectedYear, currentYear, currentMonth, selectedMonth, setSelectedMonth]);

  // 表示する必要がない場合（条件分岐はHooksの後に配置）
  if (selectedAction === 'today_details' || 
      selectedAction === 'year_trend') {  // 年ごと傾向では年月選択不要
    return null;
  }

  const handleYearChange = (event) => {
    const newYear = event.target.value;
    setSelectedYear(newYear);
    if (newYear && selectedMonth && selectedAction) {
      fetchCalendarData();
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    if (selectedYear && event.target.value && selectedAction) {
      fetchCalendarData();
    }
  };

  const handlePreviousMonth = () => {
    if (!selectedYear || !selectedMonth || loading || dateChanging) return;
    
    let newMonth = parseInt(selectedMonth) - 1;
    let newYear = parseInt(selectedYear);
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
      if (newYear < 2021) return;
    }
    
    console.log(`Moving to previous month: ${newYear}年${newMonth}月`);
    updateMonthAndFetch(newYear, newMonth);
  };
  
  const handleNextMonth = () => {
    if (!selectedYear || !selectedMonth || loading || dateChanging) return;
    
    let newMonth = parseInt(selectedMonth) + 1;
    let newYear = parseInt(selectedYear);
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    
    if (newYear > currentYear || (newYear === currentYear && newMonth > currentMonth)) {
      return;
    }
    
    console.log(`Moving to next month: ${newYear}年${newMonth}月`);
    updateMonthAndFetch(newYear, newMonth);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'stretch', 
      gap: isScrolled ? 0.4 : 0.6,
      width: isMobile ? '100%' : 'auto',
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: isMobile ? 'stretch' : 'center', 
        gap: isScrolled ? (isMobile ? 0.5 : 0.6) : (isMobile ? 0.8 : 1.0) 
      }}>
        <Typography 
          variant="labelL" 
          sx={{ 
            color: theme.palette.text.white, 
            fontWeight: 'bold',
            textAlign: 'left',
            fontSize: isScrolled ? (isMobile ? '0.7rem' : '0.85rem') : (isMobile ? '0.85rem' : '0.95rem'),
            whiteSpace: 'nowrap',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          データの年・月
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: isMobile ? '100%' : 'auto',
            gap: isMobile ? 0.8 : 1.2,
            flexWrap: 'nowrap',
            position: 'relative'
          }}
        >
          <Tooltip title="前の月">
            <span>
              {isMobile || isTablet ? (
                <IconButton 
                  onClick={handlePreviousMonth}
                  disabled={loading || dateChanging || !selectedYear || !selectedMonth || (selectedYear === "2021" && selectedMonth === "1")}
                  className={dateChanging ? 'button-loading' : ''}
                  sx={{ 
                    width: isScrolled ? (isMobile ? '28px' : '36px') : (isMobile ? '32px' : '40px'),
                    height: isScrolled ? (isMobile ? '28px' : '36px') : (isMobile ? '32px' : '40px'),
                    bgcolor: 'white', 
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.6)',
                      color: 'rgba(0, 0, 0, 0.38)',
                    },
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
              ) : (
                <Button 
                  variant="contained"
                  onClick={handlePreviousMonth}
                  disabled={loading || dateChanging || !selectedYear || !selectedMonth || (selectedYear === "2021" && selectedMonth === "1")}
                  sx={{ 
                    minWidth: '40px',
                    maxWidth: isSmallDesktop ? '60px' : '80px',
                    bgcolor: 'white', 
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.6)',
                      color: 'rgba(0, 0, 0, 0.38)',
                    },
                    px: isSmallDesktop ? 1 : 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    height: '40px'
                  }}
                >
                  {isSmallDesktop ? <ArrowBackIosNewIcon fontSize="small" /> : "前の月"}
                </Button>
              )}
            </span>
          </Tooltip>
          
          <Box sx={{ 
            display: 'flex', 
            flex: isMobile ? 1 : 'none',
            gap: isMobile ? 0.8 : 1,
            position: 'relative'
          }}>
            {/* 年選択 */}
            <FormControl variant="outlined" sx={{ 
              width: isMobile ? '50%' : isSmallDesktop ? 110 : 140,
              '& .MuiOutlinedInput-root': {
                height: isScrolled ? (isMobile ? '28px' : '36px') : (isMobile ? '32px' : '40px'),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              },
              position: 'relative'
            }}>
              <Tooltip title="年を選択">
                <Select
                  value={selectedYear || ''}
                  onChange={handleYearChange}
                  disabled={loading || dateChanging}
                  displayEmpty
                  renderValue={(value) => {
                    if (value === "") return "----年";
                    return value + "年";
                  }}
                  endAdornment={
                    dateChanging ? (
                      <CircularProgress 
                        size={14} 
                        sx={{ 
                          marginRight: 1,
                          color: theme.palette.primary.main
                        }} 
                      />
                    ) : null
                  }
                  sx={{
                    backgroundColor: (loading || dateChanging) ? 'rgba(255, 255, 255, 0.7)' : 'white',
                    borderRadius: '8px',
                    '.MuiSelect-icon': { 
                      color: (loading || dateChanging) ? 'rgba(0, 0, 0, 0.38)' : theme.palette.text.secondary,
                      right: isMobile ? '4px' : '8px',
                      fontSize: isMobile ? '1rem' : '1.25rem',
                      display: dateChanging ? 'none' : 'block'
                    },
                    ...theme.typography.bodyM,
                    padding: isMobile ? '4px 4px' : '4px 8px',
                    '& .MuiOutlinedInput-input': {
                      padding: isMobile ? '4px 4px 4px 8px' : isSmallDesktop ? '4px 4px' : '4px 8px',
                    },
                    color: selectedYear === "" ? theme.palette.text.secondary : theme.palette.text.primary,
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    fontWeight: 500,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        borderRadius: '8px',
                        marginTop: '8px'
                      }
                    }
                  }}
                >
                  {yearItems.map((item) => (
                    <MenuItem 
                      key={item.value} 
                      value={item.value} 
                      sx={{
                        ...theme.typography.bodyM,
                        fontSize: isMobile ? '0.9rem' : '0.95rem',
                        minHeight: isMobile ? '40px' : '48px'
                      }}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </Tooltip>
              
              {/* 年のローディングオーバーレイ */}
              {dateChanging && (
                <Box 
                  className="loading-overlay" 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '8px', 
                    zIndex: 2 
                  }}
                >
                  <CircularProgress size={20} />
                </Box>
              )}
            </FormControl>
            
            {/* 月選択 */}
            <FormControl variant="outlined" sx={{ 
              width: isMobile ? '50%' : isSmallDesktop ? 100 : 120,
              '& .MuiOutlinedInput-root': {
                height: isScrolled ? (isMobile ? '28px' : '36px') : (isMobile ? '32px' : '40px'),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              },
              position: 'relative'
            }}>
              <Tooltip title="月を選択">
                <Select
                  value={selectedMonth || ''}
                  onChange={handleMonthChange}
                  disabled={loading || !selectedYear || dateChanging}
                  displayEmpty
                  renderValue={(value) => {
                    if (value === "") return "--月";
                    return value + "月";
                  }}
                  endAdornment={
                    dateChanging ? (
                      <CircularProgress 
                        size={14} 
                        sx={{ 
                          marginRight: 1,
                          color: theme.palette.primary.main
                        }} 
                      />
                    ) : null
                  }
                  sx={{
                    backgroundColor: (loading || dateChanging) ? 'rgba(255, 255, 255, 0.7)' : 'white',
                    borderRadius: '8px',
                    '.MuiSelect-icon': { 
                      color: (loading || dateChanging) ? 'rgba(0, 0, 0, 0.38)' : theme.palette.text.secondary,
                      right: isMobile ? '4px' : '8px',
                      fontSize: isMobile ? '1rem' : '1.25rem',
                      display: dateChanging ? 'none' : 'block'
                    },
                    ...theme.typography.bodyM,
                    padding: isMobile ? '4px 4px' : '4px 8px',
                    '& .MuiOutlinedInput-input': {
                      padding: isMobile ? '4px 4px 4px 8px' : isSmallDesktop ? '4px 4px' : '4px 8px',
                    },
                    color: selectedMonth === "" ? theme.palette.text.secondary : theme.palette.text.primary,
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    fontWeight: 500,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        borderRadius: '8px',
                        marginTop: '8px'
                      }
                    }
                  }}
                >
                  {availableMonths.map((item) => (
                    <MenuItem 
                      key={item.value} 
                      value={item.value} 
                      sx={{
                        ...theme.typography.bodyM,
                        fontSize: isMobile ? '0.9rem' : '0.95rem',
                        minHeight: isMobile ? '40px' : '48px'
                      }}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </Tooltip>
              
              {/* 月のローディングオーバーレイ */}
              {dateChanging && (
                <Box 
                  className="loading-overlay" 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '8px', 
                    zIndex: 2 
                  }}
                >
                  <CircularProgress size={20} />
                </Box>
              )}
            </FormControl>
          </Box>
          
          <Tooltip title="次の月">
            <span>
              {isMobile || isTablet ? (
                <IconButton
                  onClick={handleNextMonth}
                  disabled={loading || dateChanging || !selectedYear || !selectedMonth || (selectedYear === currentYear.toString() && selectedMonth === currentMonth.toString())}
                  className={dateChanging ? 'button-loading' : ''}
                  sx={{ 
                    width: isScrolled ? (isMobile ? '28px' : '36px') : (isMobile ? '32px' : '40px'),
                    height: isScrolled ? (isMobile ? '28px' : '36px') : (isMobile ? '32px' : '40px'),
                    bgcolor: 'white', 
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.6)',
                      color: 'rgba(0, 0, 0, 0.38)',
                    },
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              ) : (
                <Button 
                  variant="contained"
                  onClick={handleNextMonth}
                  disabled={loading || dateChanging || !selectedYear || !selectedMonth || (selectedYear === currentYear.toString() && selectedMonth === currentMonth.toString())}
                  sx={{ 
                    minWidth: '40px',
                    maxWidth: isSmallDesktop ? '60px' : '80px',
                    bgcolor: 'white', 
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.6)',
                      color: 'rgba(0, 0, 0, 0.38)',
                    },
                    px: isSmallDesktop ? 1 : 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    height: '40px'
                  }}
                >
                  {isSmallDesktop ? <ArrowForwardIosIcon fontSize="small" /> : "次の月"}
                </Button>
              )}
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

DateSelect.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  isTablet: PropTypes.bool.isRequired,
  isSmallDesktop: PropTypes.bool.isRequired,
  isScrolled: PropTypes.bool.isRequired,
  selectedAction: PropTypes.string,
  selectedYear: PropTypes.string,
  setSelectedYear: PropTypes.func.isRequired,
  selectedMonth: PropTypes.string,
  setSelectedMonth: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  dateChanging: PropTypes.bool.isRequired,
  fetchCalendarData: PropTypes.func.isRequired,
  updateMonthAndFetch: PropTypes.func.isRequired,
};

export default DateSelect;
