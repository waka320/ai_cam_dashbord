import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';

function AISection() {
    return (
        <Box variant="outlined" sx={{ marginTop: '8px', border: '1px solid black', padding: '16px' }}>
            <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', marginTop: '0px', display: 'flex', alignItems: 'center', marginBottom: '16px' }}
            >
                <PsychologyAltIcon sx={{ fontSize: 'inherit', marginRight: '8px' }} />
                AIからのアドバイス
            </Typography>
            <Typography variant="bodyM" sx={{ marginBottom: '16px' }}>
                やりたいことは「長期休暇のタイミングを検討したい」ですので、入力から以下のタイミングが検討できると推測できます。
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                2月下旬〜3月初頭
            </Typography>
            <Typography variant="bodyM" sx={{ marginBottom: '16px' }}>
                他の時期と比較すると、この期間は交通量が比較的穏やかで、このタイミングの休暇は経営上のリスクが低いと思われます。
            </Typography>
            <Typography variant="bodyM" sx={{ marginBottom: '16px' }}>
                また、以下のタイミングに長期休暇を検討しても良い可能性があります：
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                12月第2週
            </Typography>
            <Typography variant="bodyM" sx={{ marginBottom: '16px' }}>
                この期間も例年と比較すると比較的歩行者数が少ないタイミングです。また、高山市の主要な行事も開催されていません。
            </Typography>
            <Typography variant="bodyM" sx={{ fontWeight: 'bold' }}>
                長期休暇を設定する際は、店舗の経営状況や高山市の行事も検討することが重要です。
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', alignItems: 'center' }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="追加の質問をする"
                    sx={{ flexGrow: 1, marginRight: '8px' }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    sx={{ minWidth: 'auto' }}
                >
                    送信
                </Button>
            </Box>
        </Box>
    );
}
export default AISection;
