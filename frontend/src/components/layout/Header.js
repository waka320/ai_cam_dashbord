import React from 'react';
import { AppBar, Toolbar, Typography, Button, Select, MenuItem, Box, FormControl } from '@mui/material';
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
        fetchCalendarData
    } = useCalendar();

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

    let yearItems = [
        { value: "2021", label: "2021" },
        { value: "2022", label: "2022" },
        { value: "2023", label: "2023" },
        { value: "2024", label: "2024" },
        { value: "2025", label: "2025" },
    ];

    let monthItems = [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
        { value: "6", label: "6" },
        { value: "7", label: "7" },
        { value: "8", label: "8" },
        { value: "9", label: "9" },
        { value: "10", label: "10" },
        { value: "11", label: "11" },
        { value: "12", label: "12" },

    ];

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
        if (event.target.value && selectedYear && selectedAction) {
            fetchCalendarData();
        }
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
        if (event.target.value && selectedYear && selectedAction) {
            fetchCalendarData();
        }
    };

    const handleChange = (event) => {
        setSelectedAction(event.target.value);
        if (event.target.value && selectedYear && selectedAction) {
            fetchCalendarData();
        }
    };
    return (
        <AppBar position="static" color="primary" sx={{ padding: '8px 8px' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                        variant="h6"
                        sx={{
                            marginRight: '16px',
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
                            displayEmpty
                            renderValue={(value) => {
                                if (value === "") return "未入力";
                                const selectedItem = menuItems.find((item) => item.value === value);
                                return selectedItem ? selectedItem.label : "";
                            }}
                            sx={{
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                color:
                                    selectedAction === ""
                                        ? theme.palette.text.secondary
                                        : theme.palette.text.primary,
                                padding: '4px 8px',
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <FormControl variant="outlined" sx={{ minWidth: 100 }}>
                                <Select
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    displayEmpty
                                    renderValue={(value) => {
                                        if (value === "") return "----年";
                                        const selectedYear = yearItems.find((item) => item.value === value);
                                        return selectedYear ? selectedYear.label + "年" : "";
                                    }}
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: '4px',
                                        '.MuiSelect-icon': { color: theme.palette.text.secondary },
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
                                    displayEmpty
                                    renderValue={(value) => {
                                        if (value === "") return "--月";
                                        const selectedMonth = monthItems.find((item) => item.value === value);
                                        return selectedMonth ? selectedMonth.label + "月" : "";
                                    }}
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: '4px',
                                        '.MuiSelect-icon': { color: theme.palette.text.secondary },
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
                                    {monthItems.map((item) => (
                                        <MenuItem key={item.value} value={item.value} sx={theme.typography.bodyM}>
                                            {item.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        href="#"
                        sx={{
                            textTransform: 'none',

                            fontWeight: 'bold',
                            marginRight: '16px',
                        }}
                    >
                        <Typography
                            variant="bodyM"
                            sx={{
                                color: theme.palette.text.white,
                                textDecoration: 'underline',
                                '&:hover': {
                                    color: theme.palette.text.secondary,
                                },
                            }}
                        >
                            ご意見・お問い合わせはこちらから
                        </Typography>
                    </Button>
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
