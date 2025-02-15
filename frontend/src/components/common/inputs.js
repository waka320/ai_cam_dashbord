import React, { useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'; // チェックボックスアイコン
import theme from '../../theme/theme';

function Inputs() {
    const [selectedLocation, setSelectedLocation] = useState("本町3丁目商店街");

    const handleChange = (event) => {
        setSelectedLocation(event.target.value);
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckBoxOutlinedIcon sx={{ color: '#000000' }} />
                <Typography variant="bodyL" sx={{ color: '#000000', fontWeight: 'bold' }}>
                    計測場所
                </Typography>

                <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                    <Select
                        value={selectedLocation}
                        onChange={handleChange}
                        displayEmpty
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            '.MuiSelect-icon': { color: theme.palette.text.secondary }, // ドロップダウンアイコンの色
                            '.MuiOutlinedInput-notchedOutline': { borderColor: '#CCCCCC' }, // ボーダー色
                        }}
                    >
                        <MenuItem value="本町3丁目商店街">本町3丁目商店街</MenuItem>
                        <MenuItem value="中央公園">中央公園</MenuItem>
                        <MenuItem value="駅前広場">駅前広場</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* 左側のアイコンとテキスト */}
                <CheckBoxOutlinedIcon sx={{ color: '#000000' }} />
                <Typography variant="body1" sx={{ color: '#000000', fontWeight: 'bold' }}>
                    計測場所
                </Typography>

                {/* 右側のセレクトボックス */}
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <Select
                        value={selectedLocation}
                        onChange={handleChange}
                        displayEmpty
                        sx={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '4px',
                            '.MuiSelect-icon': { color: '#999999' }, // ドロップダウンアイコンの色
                            '.MuiOutlinedInput-notchedOutline': { borderColor: '#CCCCCC' }, // ボーダー色
                        }}
                    >
                        <MenuItem value="本町3丁目商店街">本町3丁目商店街</MenuItem>
                        <MenuItem value="中央公園">中央公園</MenuItem>
                        <MenuItem value="駅前広場">駅前広場</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
}

export default Inputs;
