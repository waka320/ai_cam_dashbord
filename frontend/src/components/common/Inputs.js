import React from 'react';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import { useCalendar } from '../../contexts/CalendarContext';

import theme from '../../theme/theme';

function Inputs() {
    const { selectedLocation, setSelectedLocation, fetchCalendarData, loading } = useCalendar();

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

    const handleLocationChange = (event) => {
        setSelectedLocation(event.target.value);
        if (event.target.value) {
            fetchCalendarData();
        }
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
                        disabled={loading}
                        displayEmpty
                        renderValue={(value) => {
                            if (value === "") return "未入力";
                            const selectedLocation = locationItems.find((item) => item.value === value);
                            return selectedLocation ? selectedLocation.label : "";
                        }}
                        sx={{
                            backgroundColor: loading ? 'rgba(0, 0, 0, 0.05)' : 'white',
                            borderRadius: '4px',
                            '.MuiSelect-icon': { color: loading ? 'rgba(0, 0, 0, 0.38)' : theme.palette.text.secondary },
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
        </Box>
    );
}

export default Inputs;
