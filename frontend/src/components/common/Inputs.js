import React, { useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import theme from '../../theme/theme';

function Inputs() {

    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");


    const locationItems = [
        { value: "omotesando", label: "表参道" },
        { value: "yottekan", label: "よって館しもちょう" },
        { value: "honmachi4", label: "本町4丁目商店街" },
        { value: "honmachi3", label: "本町3丁目商店街" },
        { value: "honmachi2", label: "本町2丁目商店街" },
        { value: "kokubunjidori", label: "国分寺通り 第二商店街" },
        { value: "yasukawadori", label: "やすかわ通り商店街" },
        { value: "jinnya", label: "高山陣屋前交差点" },
        { value: "nakabashi", label: "中橋" },
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





    const handleLocationChange = (event) => {
        setSelectedLocation(event.target.value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };


    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center', padding: '8px 6px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideoCameraFrontIcon sx={{ color: theme.palette.text.primary }} />
                <Typography variant="labelL" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                    計測場所
                </Typography>
                <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                    <Select
                        value={selectedLocation}
                        onChange={handleLocationChange}
                        displayEmpty
                        renderValue={(value) => {
                            if (value === "") return "未入力";
                            const selectedLocation = locationItems.find((item) => item.value === value);
                            return selectedLocation ? selectedLocation.label : "";
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
                        }}
                    >
                        {locationItems.map((item) => (
                            <MenuItem key={item.value} value={item.value} sx={theme.typography.bodyM}>
                                {item.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon sx={{ color: theme.palette.text.primary }} />
                <Typography variant="labelL" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                    データの期間
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
    );
}

export default Inputs;
