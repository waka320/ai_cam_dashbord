import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { useCalendar } from '../../contexts/CalendarContext';

function AISection() {
  const { aiAdvice, loading, selectedAction } = useCalendar();

  // ローディング中の表示
  if (loading) {
    return (
      <Box variant="outlined" sx={{ marginTop: '8px', border: '1px solid black', padding: '16px' }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold', marginTop: '0px', display: 'flex', alignItems: 'center', marginBottom: '16px' }}
        >
          <PsychologyAltIcon sx={{ fontSize: 'inherit', marginRight: '8px' }} />
          AIからのアドバイス
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          AIがデータを分析中です...
        </Typography>
      </Box>
    );
  }

  // アドバイスがない場合の表示
  if (!aiAdvice) {
    return (
      <Box variant="outlined" sx={{ marginTop: '8px', border: '1px solid black', padding: '16px' }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold', marginTop: '0px', display: 'flex', alignItems: 'center', marginBottom: '16px' }}
        >
          <PsychologyAltIcon sx={{ fontSize: 'inherit', marginRight: '8px' }} />
          AIからのアドバイス
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          場所、目的、年月を選択すると、AIからのアドバイスが表示されます。
        </Typography>
      </Box>
    );
  }

  // アドバイスの表示
  return (
    <Box variant="outlined" sx={{ marginTop: '8px', border: '1px solid black', padding: '16px' }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 'bold', marginTop: '0px', display: 'flex', alignItems: 'center', marginBottom: '16px' }}
      >
        <PsychologyAltIcon sx={{ fontSize: 'inherit', marginRight: '8px' }} />
        AIからのアドバイス
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '16px' }}>
        やりたいことは「{selectedAction}」に対するデータ分析結果
      </Typography>
      <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
        {aiAdvice}
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
