import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Select, MenuItem, Box, FormControl, Button } from '@mui/material';
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
        loading
    } = useCalendar();

    // 現在の日付情報を取得
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // JavaScriptの月は0から始まるので+1

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

    // 年のリストを動的に生成 (2021年から現在の年まで)
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

    // 年が変更されたときに月のリストを更新
    useEffect(() => {
        // generateMonthItems を useEffect 内に移動して依存配列の問題を解決
        const generateMonthItemsInEffect = (year) => {
            if (!year) return [];
            
            const months = [];
            // 選択された年が現在の年なら、現在の月までしか選べないようにする
            const maxMonth = year === currentYear.toString() ? currentMonth : 12;
            
            for (let month = 1; month <= maxMonth; month++) {
                months.push({ value: month.toString(), label: month.toString() });
            }
            return months;
        };

        setAvailableMonths(generateMonthItemsInEffect(selectedYear));
        
        // もし選択中の月が新しい年の制限を超えていれば、月の選択をリセットする
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

    // 前の月に移動する関数
    const handlePreviousMonth = () => {
        if (!selectedYear || !selectedMonth) return;
        
        let newMonth = parseInt(selectedMonth) - 1;
        let newYear = parseInt(selectedYear);
        
        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
            // 2021年より前には戻れないようにする
            if (newYear < 2021) return;
        }
        
        setSelectedYear(newYear.toString());
        setSelectedMonth(newMonth.toString());
        
        // データを更新
        if (selectedAction) {
            setTimeout(() => fetchCalendarData(), 100);
        }
    };
    
    // 次の月に移動する関数
    const handleNextMonth = () => {
        if (!selectedYear || !selectedMonth) return;
        
        let newMonth = parseInt(selectedMonth) + 1;
        let newYear = parseInt(selectedYear);
        
        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }
        
        // 現在の年月より先には進めないようにする
        if (newYear > currentYear || (newYear === currentYear && newMonth > currentMonth)) {
            return;
        }
        
        setSelectedYear(newYear.toString());
        setSelectedMonth(newMonth.toString());
        
        // データを更新
        if (selectedAction) {
            setTimeout(() => fetchCalendarData(), 100);
        }
    };

    return (
        <AppBar position="static" color="primary" sx={{ padding: '8px 8px' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                        variant="h6"
                        sx={{
                            marginRight: '12px',
                            color: theme.palette.text.white,
                            fontWeight: 'bold',
                        }}
                    >
                        「やりたいこと」は...
                    </Typography>

                    <FormControl variant="outlined" sx={{ minWidth: '200px' }}>
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
                                borderRadius: '4px',
                                color:
                                    selectedAction === ""
                                        ? theme.palette.text.secondary
                                        : theme.palette.text.primary,
                                padding: '4px 8px',
                                '.MuiSelect-icon': { color: loading ? 'rgba(0, 0, 0, 0.38)' : theme.palette.text.secondary },
                            }}
                        >
                            {menuItems.map((item) => (
                                <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: '16px' }}>
                        <Typography variant="labelL" sx={{ color: theme.palette.text.white, fontWeight: 'bold' }}>
                            データの年・月
                        </Typography>
                        
                        <Button 
                            variant="contained"
                            onClick={handlePreviousMonth}
                            disabled={loading || !selectedYear || !selectedMonth || (selectedYear === "2021" && selectedMonth === "1")}
                            sx={{ 
                                minWidth: '80px', 
                                bgcolor: 'white', 
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                },
                                '&:disabled': {
                                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                                    color: 'rgba(0, 0, 0, 0.38)',
                                }
                            }}
                        >
                            前の月
                        </Button>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <FormControl variant="outlined" sx={{ minWidth: 100 }}>
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
                                        borderRadius: '4px',
                                        '.MuiSelect-icon': { color: loading ? 'rgba(0, 0, 0, 0.38)' : theme.palette.text.secondary },
                                        ...theme.typography.bodyM,
                                        padding: '4px 8px',
                                        '& .MuiOutlinedInput-input': {
                                            padding: '4px 8px',
                                        },
                                        color:
                                            selectedYear === ""
                                                ? theme.palette.text.secondary
                                                : theme.palette.text.primary,
                                    }}
                                >
                                    {yearItems.map((item) => (
                                        <MenuItem key={item.value} value={item.value} sx={theme.typography.bodyM}>
                                            {item.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl variant="outlined" sx={{ minWidth: 80 }}>
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
                                        borderRadius: '4px',
                                        '.MuiSelect-icon': { color: loading ? 'rgba(0, 0, 0, 0.38)' : theme.palette.text.secondary },
                                        ...theme.typography.bodyM,
                                        padding: '4px 8px',
                                        '& .MuiOutlinedInput-input': {
                                            padding: '4px 8px',
                                        },
                                        color:
                                            selectedMonth === ""
                                                ? theme.palette.text.secondary
                                                : theme.palette.text.primary,
                                    }}
                                >
                                    {availableMonths.map((item) => (
                                        <MenuItem key={item.value} value={item.value} sx={theme.typography.bodyM}>
                                            {item.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        
                        <Button 
                            variant="contained"
                            onClick={handleNextMonth}
                            disabled={loading || !selectedYear || !selectedMonth || (selectedYear === currentYear.toString() && selectedMonth === currentMonth.toString())}
                            sx={{ 
                                minWidth: '80px', 
                                bgcolor: 'white', 
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                },
                                '&:disabled': {
                                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                                    color: 'rgba(0, 0, 0, 0.38)',
                                }
                            }}
                        >
                            次の月
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        component="img"
                        src={logo}
                        alt="目的ベースダッシュボードのロゴ"
                        sx={{ height: '50px', objectFit: 'contain' }}
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
