import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppBar, Toolbar, Typography, Select, MenuItem, Box, FormControl, Button, useMediaQuery, IconButton, Tooltip, Paper } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import theme from '../../theme/theme';
import logo from '../../assets/dashbord_logo.png';
import { useCalendar } from '../../contexts/CalendarContext';
import ShareButton from '../ui/ShareButton';

function Header() {
    const {
        selectedAction,
        setSelectedAction,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        selectedLocation,
        setSelectedLocation,
        fetchCalendarData,
        loading,
        updateMonthAndFetch
    } = useCalendar();
    
    const isMobile = useMediaQuery('(max-width:768px)');
    const isTablet = useMediaQuery('(min-width:769px) and (max-width:1024px)');
    const isSmallDesktop = useMediaQuery('(min-width:1025px) and (max-width:1280px)');
    const location = useLocation();

    // 特定のページかどうかをチェック
    const isSpecialPage = useCallback(() => {
        return ['/terms', '/how-to-use', '/sitemap'].includes(location.pathname);
    }, [location.pathname]);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    // 計測場所の選択肢
    const locationItems = [
        // 既存のデータ
        { value: "omotesando", label: "表参道" },
        { value: "yottekan", label: "よって館しもちょう" },
        { value: "honmachi4", label: "本町4丁目商店街" },
        { value: "honmachi3", label: "本町3丁目商店街" },
        { value: "honmachi2", label: "本町2丁目商店街" },
        { value: "kokubunjidori", label: "国分寺通り 第二商店街" },
        { value: "yasukawadori", label: "やすかわ通り商店街" },
        { value: "jinnya", label: "高山陣屋前交差点" },
        { value: "nakabashi", label: "中橋" },
        // 観光案内所データを先頭に追加
        { value: "old-town", label: "古い町並" },
        { value: "station", label: "駅前" },
        { value: "gyouzinbashi", label: "行神橋" },
    ];

    // 現在の年月を自動的に設定するためのuseEffect
    useEffect(() => {
        // 年月が未選択の場合のみ自動設定する
        if (!selectedYear) {
            setSelectedYear(currentYear.toString());
        }

        // 年が選択されていて月が未選択の場合、または
        // 年を現在の年に自動設定した場合に月も自動設定する
        if (selectedYear && !selectedMonth) {
            // 選択された年が現在の年であれば現在の月を、それ以外は12月を設定
            const monthToSet = selectedYear === currentYear.toString() ? currentMonth.toString() : "12";
            setSelectedMonth(monthToSet);
        }
    }, [selectedYear, selectedMonth, currentYear, currentMonth, setSelectedYear, setSelectedMonth]);

    // モバイル表示用の短縮ラベルを追加
    const menuItems = [
        { value: "cal_holiday", label: "店舗の定休日を検討したい", shortLabel: "店舗の定休日を検討" },
        { value: "cal_shoping_holiday", label: "商店街の定休日を検討したい", shortLabel: "商店街の定休日を検討" },
        { value: "cal_long_holiday", label: "長期休暇のタイミングを検討したい", shortLabel: "長期休暇のタイミングを検討" },
        { value: "cal_event", label: "イベントの開催日程を検討したい", shortLabel: "イベントの開催日程を検討" },
        { value: "cal_training", label: "研修のタイミングを検討したい", shortLabel: "研修のタイミングを検討" },
        { value: "dti_event_time", label: "イベントの開催時刻を検討したい", shortLabel: "イベントの開催時刻を検討" },
        { value: "wti_shift", label: "アルバイトのシフトを検討したい", shortLabel: "アルバイトのシフトを検討" },
        { value: "dti_open_hour", label: "お店の営業時刻を検討したい", shortLabel: "お店の営業時刻を検討" },
        { value: "dti_shoping_open_hour", label: "商店街の営業時刻を検討したい", shortLabel: "商店街の営業時刻を検討" },
        { value: "cal_cog", label: "カレンダー形式の混雑度が見たい", shortLabel: "カレンダー形式混雑度を見る" },
        { value: "dti_cog", label: "日時形式の混雑度が見たい", shortLabel: "日時形式混雑度を見る" },
        { value: "wti_cog", label: "曜日形式の混雑度が見たい", shortLabel: "曜日形式混雑度を見る" },
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
    const [isScrolled, setIsScrolled] = useState(false);
    const headerRef = useRef(null);

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

    useEffect(() => {
        if (isSpecialPage()) return; // 特定のページでは実行しない
        
        const handleScroll = () => {
            if (headerRef.current) {
                const headerBottom = headerRef.current.getBoundingClientRect().bottom;
                setIsScrolled(headerBottom < 0);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isSpecialPage]);

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

    const handleLocationChange = (event) => {
        setSelectedLocation(event.target.value);
        if (event.target.value) {
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

    const ActionSelectionContent = () => (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                width: isMobile ? '100%' : isTablet || isSmallDesktop ? '100%' : 'auto',
                gap: isScrolled ? (isMobile ? 0.5 : 0.8) : (isMobile ? 1 : 1.5),
                mb: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            <Typography
                variant={isMobile ? "bodyL" : "h6"}
                sx={{
                    marginRight: isMobile ? 0 : '10px',
                    color: theme.palette.text.white,
                    fontWeight: 'bold',
                    textAlign: isMobile ? 'center' : 'left',
                    fontSize: isScrolled ? 
                        (isMobile ? '0.75rem' : '0.9rem') : 
                        (isMobile ? '0.9rem' : isTablet || isSmallDesktop ? '1.1rem' : undefined),
                    whiteSpace: 'nowrap',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                やりたいことは...
            </Typography>

            <FormControl variant="outlined" sx={{ 
                minWidth: isMobile ? '100%' : isTablet ? '300px' : '350px',
                maxWidth: isMobile ? 'none' : '400px',
                flex: isMobile ? 'none' : 1,
                '& .MuiOutlinedInput-root': {
                    height: isScrolled ? (isMobile ? '28px' : '34px') : (isMobile ? '32px' : '44px'),
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                        return selectedItem ? (isMobile ? selectedItem.shortLabel : selectedItem.label) : "";
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
                        fontSize: isScrolled ? 
                            (isMobile ? '0.7rem' : '0.85rem') : 
                            (isMobile ? '0.85rem' : '0.95rem'),
                        '& .MuiSelect-select': {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: 500
                        },
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
    );

    return (
        <>
            {/* 元のヘッダー - stickyポジションで滑らかに固定 */}
            <AppBar 
                position="sticky" 
                color="primary" 
                ref={headerRef} 
                sx={{ 
                    top: 0,
                    zIndex: 1100,
                    padding: isScrolled ? (isMobile ? '2px 0' : '8px 0') : (isMobile ? '4px 0' : '8px 0'),
                    boxShadow: isScrolled ? '0 4px 10px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                    borderRadius: isScrolled ? '0' : '0 0 8px 8px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isScrolled ? 'scale(0.98)' : 'scale(1)',
                    transformOrigin: 'top center',
                }}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    width: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    padding: isScrolled ? '4px 0' : '0',
                }}>
                    {/* ロゴとタイトル部分 - スクロール時は非表示 */}
                    {!isScrolled && (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            borderBottom: (isMobile || isSpecialPage()) ? 'none' : '1px solid rgba(255,255,255,0.3)',
                            py: 1,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: isScrolled ? 0 : 1,
                            transform: isScrolled ? 'translateY(-20px)' : 'translateY(0)',
                        }}>
                            <RouterLink to="/" aria-label="トップページへ戻る">
                                <Box
                                    component="img"
                                    src={logo}
                                    alt="目的ベースダッシュボードのロゴ"
                                    sx={{ 
                                        height: isMobile ? '38px' : '50px',
                                        objectFit: 'contain',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />
                            </RouterLink>
                        </Box>
                    )}
                    
                    {/* コントロール部分 - 特定のページでは表示しない */}
                    {!isSpecialPage() && (
                        <Paper elevation={0} sx={{
                            backgroundColor: 'transparent',
                            margin: isScrolled ? (isMobile ? '1px 4px' : '4px 8px') : (isMobile ? '4px 8px' : '12px 16px'),
                            borderRadius: '8px',
                            padding: isScrolled ? (isMobile ? '3px' : '6px') : (isMobile ? '6px' : '12px'),
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}>
                            <Toolbar 
                                sx={{ 
                                    display: 'flex', 
                                    flexDirection: isMobile ? 'column' : 'row',
                                    justifyContent: 'space-between', 
                                    alignItems: isMobile ? 'stretch' : 'center',
                                    gap: isScrolled ? (isMobile ? 0.5 : 1) : (isMobile ? 1 : 2),
                                    padding: '0 !important',
                                    minHeight: 'auto !important',
                                    flexWrap: isMobile ? 'nowrap' : 'wrap',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            >
                                {/* 目的選択部分 */}
                                <ActionSelectionContent />
                                
                                {/* 計測場所・年月選択部分 */}
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: 'stretch', 
                                        gap: isScrolled ? 0.5 : 1, 
                                        marginLeft: isMobile ? 0 : '0',
                                        marginTop: isMobile ? 0 : 0,
                                        width: isMobile ? '100%' : 'auto',
                                        justifyContent: 'flex-end',
                                        flexWrap: 'nowrap'
                                    }}
                                >
                                    {/* データの年・月セクション */}
                                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: isScrolled ? (isMobile ? 0.5 : 1) : (isMobile ? 0.8 : 1.5) }}>
                                        <Typography 
                                            variant="labelL" 
                                            sx={{ 
                                                color: theme.palette.text.white, 
                                                fontWeight: 'bold',
                                                textAlign: isMobile ? 'center' : 'left',
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
                                            flex: isMobile ? 1 : 'none',
                                            gap: isMobile ? 0.8 : 1
                                        }}>
                                            <FormControl variant="outlined" sx={{ 
                                                width: isMobile ? '50%' : isSmallDesktop ? 110 : 140,
                                                '& .MuiOutlinedInput-root': {
                                                    height: isScrolled ? (isMobile ? '28px' : '36px') : (isMobile ? '32px' : '40px'),
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                                                    height: isScrolled ? (isMobile ? '28px' : '36px') : (isMobile ? '32px' : '40px'),
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                                                            return value + "月";
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

                                    {/* 計測場所セクション */}
                                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: isScrolled ? (isMobile ? 0.5 : 1) : (isMobile ? 0.8 : 1.5) }}>
                                        <Typography 
                                            variant="labelL" 
                                            sx={{ 
                                                color: theme.palette.text.white, 
                                                fontWeight: 'bold',
                                                textAlign: isMobile ? 'center' : 'left',
                                                fontSize: isScrolled ? (isMobile ? '0.7rem' : '0.85rem') : (isMobile ? '0.85rem' : '0.95rem'),
                                                whiteSpace: 'nowrap',
                                                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                        >
                                            計測場所
                                        </Typography>
                                        
                                        {/* 計測場所選択 */}
                                        <FormControl variant="outlined" sx={{ 
                                            width: isMobile ? '100%' : isSmallDesktop ? 150 : 180,
                                            '& .MuiOutlinedInput-root': {
                                                height: isScrolled ? (isMobile ? '28px' : '36px') : (isMobile ? '32px' : '40px'),
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }
                                        }}>
                                            <Tooltip title="計測場所を選択">
                                                <Select
                                                    value={selectedLocation}
                                                    onChange={handleLocationChange}
                                                    disabled={loading}
                                                    displayEmpty
                                                    renderValue={(value) => {
                                                        if (value === "") return "場所未選択";
                                                        const selectedLoc = locationItems.find((item) => item.value === value);
                                                        return selectedLoc ? selectedLoc.label : "";
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
                                                            selectedLocation === ""
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
                                                    {locationItems.map((item) => (
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
                                </Box>

                                {/* 共有ボタン */}
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'row',
                                        alignItems: 'center', 
                                        gap: 1.5, 
                                        ml: isMobile ? 0 : 1
                                    }}
                                >
                                    <ShareButton 
                                        variant='button' 
                                        size={isMobile ? 'small' : 'medium'} 
                                    />
                                </Box>
                            </Toolbar>
                        </Paper>
                    )}
                </Box>
            </AppBar>
        </>
    );
}

export default Header;
