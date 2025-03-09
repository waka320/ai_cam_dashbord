import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { useCalendar } from '../../contexts/CalendarContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function AISection() {
  const { aiAdvice, loading} = useCalendar();

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
      <Box className="markdown-body" sx={{ 
        maxHeight: '400px',  // 最大高さを設定
        overflowY: 'auto',   // 縦方向のスクロールを有効化
        padding: '0 8px',    // 横方向に少しパディングを追加
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        }
      }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAdvice}</ReactMarkdown>
      </Box>
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
