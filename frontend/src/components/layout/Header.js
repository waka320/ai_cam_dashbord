import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Select, MenuItem, Box, FormControl, Button, useMediaQuery, IconButton, Tooltip, Paper } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import theme from '../../theme/theme';
import logo from '../../assets/dashbord_logo.png';
import { useCalendar } from '../../contexts/CalendarContext';

function Header() {
    const {
        selectedAction,
        setSelectedAction,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        fetchCalendarData,
        loading,
        updateMonthAndFetch
    } = useCalendar();
    
    const isMobile = useMediaQuery('(max-width:768px)');
    const isTablet = useMediaQuery('(min-width:769px) and (max-width:1024px)');
    const isSmallDesktop = useMediaQuery('(min-width:1025px) and (max-width:1280px)');

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const menuItems = [
        { value: "cal_holiday", label: "店舗の定休日を検討したい" },
        { value: "cal_shoping_holiday", label: "商店街の定休日を検討したい" },
        { value: "cal_long_holiday", label: "長期休暇のタイミングを検討したい" },
        { value: "cal_event", label: "イベントの開催日程を検討したい" },
        { value: "cal_training", label: "研修のタイミングを検討したい" },
        { value: "wti_event_effect", label: "イベントの効果を確認したい" },
        { value: "wti_event_time", label: "イベントの開催時間を検討したい" },
        { value: "wti_shift", label: "アルバイトのシフトを検討したい" },
        { value: "dti_open_hour", label: "お店の営業時間を検討したい" },
        { value: "dti_shoping_open_hour", label: "商店街の営業時間を検討したい" },
        { value: "cal_cog", label: "カレンダー形式の混雑度が見たい" },
        { value: "wti_cog", label: "日時形式の混雑度が見たい" },
        { value: "dti_cog", label: "曜日と時間帯ごとの混雑度が見たい" },
    ];

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
        const generateMonthItemsInEffect = (year) => {
            if (!year) return [];
            
            const months = [];
            const maxMonth = year === currentYear.toString() ? currentMonth : 12;
            
            for (let month = 1; month <= maxMonth; month++) {
                months.push({ value: month.toString(), label: month.toString() });
            }
            return months;
        };

        setAvailableMonths(generateMonthItemsInEffect(selectedYear));
        
        const maxAvailableMonth = selectedYear === currentYear.toString() ? currentMonth.toString() : "12";
        if (selectedMonth && parseInt(selectedMonth) > parseInt(maxAvailableMonth)) {
            setSelectedMonth("");
        }
    }, [selectedYear, currentYear, currentMonth, selectedMonth, setSelectedMonth]);

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

    const handleChange = (event) => {
        setSelectedAction(event.target.value);
        if (event.target.value && selectedYear && selectedAction) {
            fetchCalendarData();
        }
    };

    const handlePreviousMonth = () => {
        if (!selectedYear || !selectedMonth || loading) return;
        
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
        if (!selectedYear || !selectedMonth || loading) return;
        
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
        <AppBar position="static" color="primary" sx={{ 
            padding: isMobile ? '8px 0' : '8px 0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '0 0 8px 8px',
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {/* ロゴとタイトル部分 */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    borderBottom: isMobile ? 'none' : '1px solid rgba(255,255,255,0.3)',
                    py: 1
                }}>
                    <Box
                        component="img"
                        src={logo}
                        alt="目的ベースダッシュボードのロゴ"
                        sx={{ 
                            height: isMobile ? '42px' : '54px', 
                            objectFit: 'contain'
                        }}
                    />
                </Box>
                
                {/* コントロール部分 */}
                <Paper elevation={0} sx={{
                    backgroundColor: 'transparent',
                    margin: isMobile ? '8px 12px' : '12px 16px',
                    borderRadius: '8px',
                    padding: isMobile ? '8px' : '12px',
                    border: '1px solid rgba(255,255,255,0.3)',
                }}>
                    <Toolbar 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between', 
                            alignItems: isMobile ? 'stretch' : 'center',
                            gap: isMobile ? 2 : 2,
                            padding: '0 !important',
                            minHeight: 'auto !important',
                            flexWrap: isMobile ? 'nowrap' : 'wrap'
                        }}
                    >
                        {/* 目的選択部分 */}
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: isMobile ? 'stretch' : 'center',
                                width: isMobile ? '100%' : isTablet || isSmallDesktop ? '100%' : 'auto',
                                gap: isMobile ? 1 : 1.5,
                                mb: (!isMobile && (isTablet || isSmallDesktop)) ? 1.5 : 0
                            }}
                        >
                            <Typography
                                variant={isMobile ? "bodyL" : "h6"}
                                sx={{
                                    marginRight: isMobile ? 0 : '10px',
                                    color: theme.palette.text.white,
                                    fontWeight: 'bold',
                                    textAlign: isMobile ? 'center' : 'left',
                                    fontSize: isMobile ? '1rem' : isTablet || isSmallDesktop ? '1.1rem' : undefined,
                                    whiteSpace: 'nowrap',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                }}
                            >
                                やりたいことは...
                            </Typography>

                            <FormControl variant="outlined" sx={{ 
                                minWidth: isMobile ? '100%' : isTablet ? '300px' : '350px',
                                maxWidth: isMobile ? 'none' : '400px',
                                flex: isMobile ? 'none' : 1,
                                '& .MuiOutlinedInput-root': {
                                    height: isMobile ? '40px' : '44px'
                                }
                            }}>
                                <Select
                                    value={selectedAction}
                                    onChange={handleChange}
                                    disabled={loading}
                                    displayEmpty
                                    renderValue={(value) => {
                                        if (value === "") return "未入力";
                                        const selectedItem = menuItems.find((item) => item.value === value);
                                        return selectedItem ? selectedItem.label : "";
                                    }}
                                    sx={{
                                        backgroundColor: loading ? 'rgba(255, 255, 255, 0.7)' : 'white',
                                        borderRadius: '8px',
                                        color:
                                            selectedAction === ""
                                                ? theme.palette.text.secondary
                                                : theme.palette.text.primary,
                                        padding: isMobile ? '4px 8px' : '4px 8px',
                                        '.MuiSelect-icon': { 
                                            color: loading ? 'rgba(0, 0, 0, 0.38)' : theme.palette.text.secondary,
                                            right: isMobile ? '8px' : '10px'
                                        },
                                        fontSize: isMobile ? '0.9rem' : '0.95rem',
                                        '& .MuiSelect-select': {
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            fontWeight: 500
                                        },
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: isMobile ? 240 : 320,
                                                width: 'auto',
                                                maxWidth: '85vw',
                                                borderRadius: '8px',
                                                marginTop: '8px'
                                            },
                                        },
                                    }}
                                >
                                    {menuItems.map((item) => (
                                        <MenuItem 
                                            key={item.value} 
                                            value={item.value}
                                            sx={{
                                                fontSize: isMobile ? '0.9rem' : '0.95rem',
                                                minHeight: isMobile ? '40px' : '48px',
                                                fontWeight: 400
                                            }}
                                        >
                                            {item.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        
                        {/* 年月選択部分 */}
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: isMobile ? 'stretch' : 'center', 
                                gap: isMobile ? 1 : 1.5, 
                                marginLeft: isMobile ? 0 : '0',
                                marginTop: isMobile ? 0 : 0,
                                width: isMobile ? '100%' : 'auto',
                                justifyContent: 'flex-end',
                                flexWrap: 'nowrap'
                            }}
                        >
                            <Typography 
                                variant="labelL" 
                                sx={{ 
                                    color: theme.palette.text.white, 
                                    fontWeight: 'bold',
                                    textAlign: isMobile ? 'center' : 'left',
                                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                                    whiteSpace: 'nowrap',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
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
                                    flexWrap: 'nowrap'
                                }}
                            >
                                <Tooltip title="前の月">
                                    <span>
                                        {isMobile || isTablet ? (
                                            <IconButton 
                                                onClick={handlePreviousMonth}
                                                disabled={loading || !selectedYear || !selectedMonth || (selectedYear === "2021" && selectedMonth === "1")}
                                                sx={{ 
                                                    width: '40px',
                                                    height: '40px',
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
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                <ArrowBackIosNewIcon fontSize="small" />
                                            </IconButton>
                                        ) : (
                                            <Button 
                                                variant="contained"
                                                onClick={handlePreviousMonth}
                                                disabled={loading || !selectedYear || !selectedMonth || (selectedYear === "2021" && selectedMonth === "1")}
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
                                    flex: isMobile ? 2 : 'none',
                                    gap: isMobile ? 0.8 : 1
                                }}>
                                    <FormControl variant="outlined" sx={{ 
                                        width: isMobile ? '50%' : isSmallDesktop ? 110 : 140,
                                        '& .MuiOutlinedInput-root': {
                                            height: isMobile ? '40px' : '40px'
                                        }
                                    }}>
                                        <Tooltip title="年を選択">
                                            <Select
                                                value={selectedYear}
                                                onChange={handleYearChange}
                                                disabled={loading}
                                                displayEmpty
                                                renderValue={(value) => {
                                                    if (value === "") return "----年";
                                                    const selectedYear = yearItems.find((item) => item.value === value);
                                                    return selectedYear ? selectedYear.label + "年" : "";
                                                }}
                                                sx={{
                                                    backgroundColor: loading ? 'rgba(255, 255, 255, 0.7)' : 'white',
                                                    borderRadius: '8px',
                                                    '.MuiSelect-icon': { 
                                                        color: loading ? 'rgba(0, 0, 0, 0.38)' : theme.palette.text.secondary,
                                                        right: isMobile ? '4px' : '8px',
                                                        fontSize: isMobile ? '1rem' : '1.25rem'
                                                    },
                                                    ...theme.typography.bodyM,
                                                    padding: isMobile ? '4px 4px' : '4px 8px',
                                                    '& .MuiOutlinedInput-input': {
                                                        padding: isMobile ? '4px 4px 4px 8px' : isSmallDesktop ? '4px 4px' : '4px 8px',
                                                    },
                                                    color:
                                                        selectedYear === ""
                                                            ? theme.palette.text.secondary
                                                            : theme.palette.text.primary,
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
                                    </FormControl>
                                    
                                    <FormControl variant="outlined" sx={{ 
                                        width: isMobile ? '50%' : isSmallDesktop ? 100 : 120,
                                        '& .MuiOutlinedInput-root': {
                                            height: isMobile ? '40px' : '40px'
                                        }
                                    }}>
                                        <Tooltip title="月を選択">
                                            <Select
                                                value={selectedMonth}
                                                onChange={handleMonthChange}
                                                disabled={loading || !selectedYear}
                                                displayEmpty
                                                renderValue={(value) => {
                                                    if (value === "") return "--月";
                                                    const selectedMonth = availableMonths.find((item) => item.value === value);
                                                    return selectedMonth ? selectedMonth.label + "月" : "";
                                                }}
                                                sx={{
                                                    backgroundColor: loading ? 'rgba(255, 255, 255, 0.7)' : 'white',
                                                    borderRadius: '8px',
                                                    '.MuiSelect-icon': { 
                                                        color: loading ? 'rgba(0, 0, 0, 0.38)' : theme.palette.text.secondary,
                                                        right: isMobile ? '4px' : '8px',
                                                        fontSize: isMobile ? '1rem' : '1.25rem'
                                                    },
                                                    ...theme.typography.bodyM,
                                                    padding: isMobile ? '4px 4px' : '4px 8px',
                                                    '& .MuiOutlinedInput-input': {
                                                        padding: isMobile ? '4px 4px 4px 8px' : isSmallDesktop ? '4px 4px' : '4px 8px',
                                                    },
                                                    color:
                                                        selectedMonth === ""
                                                            ? theme.palette.text.secondary
                                                            : theme.palette.text.primary,
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
                                    </FormControl>
                                </Box>
                                
                                <Tooltip title="次の月">
                                    <span>
                                        {isMobile || isTablet ? (
                                            <IconButton
                                                onClick={handleNextMonth}
                                                disabled={loading || !selectedYear || !selectedMonth || (selectedYear === currentYear.toString() && selectedMonth === currentMonth.toString())}
                                                sx={{ 
                                                    width: '40px',
                                                    height: '40px',
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
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                <ArrowForwardIosIcon fontSize="small" />
                                            </IconButton>
                                        ) : (
                                            <Button 
                                                variant="contained"
                                                onClick={handleNextMonth}
                                                disabled={loading || !selectedYear || !selectedMonth || (selectedYear === currentYear.toString() && selectedMonth === currentMonth.toString())}
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
                    </Toolbar>
                </Paper>
            </Box>
        </AppBar>
    );
}

export default Header;
