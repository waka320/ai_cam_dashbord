import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Select, MenuItem, Box, FormControl } from '@mui/material';
import theme from '../../theme/theme';
import logo from '../../assets/dashbord_logo.png';

function Header() {
    const [selectedValue, setSelectedValue] = useState("");

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    return (
        <AppBar position="static" color="primary" sx={{ padding: '8px 16px' }}>
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
                            renderValue={(value) =>
                                value === "" ? "未入力" : value
                            }
                            sx={{
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                color:
                                    selectedValue === ""
                                        ? theme.palette.text.secondary 
                                        : theme.palette.text.primary, 
                                '&.Mui-focused': {
                                    color:
                                        selectedValue === ""
                                            ? theme.palette.text.secondary 
                                            : theme.palette.text.primary,
                                },
                                padding: '4px 8px',
                            }}
                        >
                            <MenuItem value="長期休暇のタイミングを検討したい">長期休暇のタイミングを検討したい</MenuItem>
                            <MenuItem value="新しいスキルを学びたい">新しいスキルを学びたい</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        href="#"
                        sx={{
                            textTransform: 'none',
                            color: theme.palette.text.white,
                            fontWeight: 'bold',
                            marginRight: '16px',
                        }}
                    >
                        ご意見・お問い合わせはこちらから
                    </Button>
                    <Box
                        component="img"
                        src={logo}
                        alt="目的ベースダッシュボードのロゴ"
                        sx={{ height: '40px', objectFit: 'contain' }}
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
