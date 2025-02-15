import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Select, MenuItem, Box, FormControl } from '@mui/material';
import theme from '../../theme/theme';
import logo from '../../assets/dashbord_logo.png';

function Header() {
    const [selectedValue, setSelectedValue] = useState("");


    const menuItems = [
        { value: "cal_holiday", label: "店舗の定休日を検討したい" },
        { value: "cal_shoping_holiday", label: "商店街の定休日を検討したい" },
        { value: "cal_long_holiday", label: "長期休暇のタイミングを検討したい" },
        { value: "cal_event", label: "イベントの開催日程を検討したい" },
        { value: "cal_training", label: "研修のタイミングを検討したい" },
        { value: "dti_event_effect", label: "イベントの効果を確認したい" },
        { value: "dti_event_time", label: "イベントの開催時間を検討したい" },
        { value: "dti_shift", label: "アルバイトのシフトを検討したい" },
        { value: "dwe_open_hour", label: "お店の営業時間を検討したい" },
        { value: "dwe_shoping_open_hour", label: "商店街の営業時間を検討したい" },
        { value: "cal_cog", label: "カレンダー形式の混雑度が見たい" },
        { value: "dti_cog", label: "日時形式の混雑度が見たい" },
        { value: "dwe_cog", label: "曜日と時間帯ごとの混雑度が見たい" },
    ];


    const handleChange = (event) => {
        setSelectedValue(event.target.value);
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
                            value={selectedValue}
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
                                    selectedValue === ""
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
