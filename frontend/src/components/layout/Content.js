import React from 'react';
import Inputs from '../common/Inputs';
import Calendar from '../common/Calendar';
import AddIcon from '@mui/icons-material/Add';
import { Box, Typography, Button, Link } from '@mui/material';
import AISection from './AISection';
import theme from '../../theme/theme';


function Content() {
    return (
        <>
            <Inputs />
            <Box sx={{ display: 'flex' }}>
                <Box sx={{ flex: 2 }}>
                    <Calendar />
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* <Button variant="outlined" sx={{ width: '200px', color: 'black', borderColor: 'black' }} startIcon={<AddIcon />}>
                        他のグラフを追加
                    </Button> */}
                    <AISection />
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                        <Typography variant='supplementaryM' sx={{ color: theme.palette.text.secondary, }}>
                            製作・協力<br />
                            <Link
                                href="https://mdg.si.i.nagoya-u.ac.jp/"
                                color="inherit"
                                sx={{ "&:hover": { color: theme.palette.text.link } }}
                                underline="hover"
                            >
                                名古屋大学 安田・遠藤・浦田研究室
                            </Link><br />
                            <Link
                                href="https://www.city.takayama.lg.jp/shisei/1005252/1021045.html"
                                color="inherit"
                                sx={{ "&:hover": { color: theme.palette.text.link } }}
                                underline="hover"
                            >
                                飛騨高山DX推進官民連携プラットフォーム
                            </Link><br />
                            NECソリューションイノベータ株式会社
                        </Typography>
                    </Box>
                </Box>
            </Box>

        </>
    );
}

export default Content;
