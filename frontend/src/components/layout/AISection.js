import React, { useState } from 'react';
import { Box, Typography, Button, useMediaQuery, TextField } from '@mui/material';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import SendIcon from '@mui/icons-material/Send';
import { useCalendar } from '../../contexts/CalendarContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function AISection() {
  const { aiAdvice, loading, askFollowupQuestion } = useCalendar();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [followupQuestion, setFollowupQuestion] = useState('');

  // 共通のスタイリング
  const containerStyles = { 
    marginTop: '8px', 
    border: '1px solid black', 
    padding: isMobile ? '12px' : '16px',
    borderRadius: '4px'
  };

  const handleAskQuestion = () => {
    if (!followupQuestion.trim()) return;
    
    // 実際のfunctionは実装されていないので追加が必要
    askFollowupQuestion?.(followupQuestion);
    setFollowupQuestion('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  // ローディング中の表示
  if (loading) {
    return (
      <Box variant="outlined" sx={containerStyles}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
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
      <Box variant="outlined" sx={containerStyles}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
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
    <Box variant="outlined" sx={containerStyles}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{ fontWeight: 'bold', marginTop: '0px', display: 'flex', alignItems: 'center', marginBottom: '16px' }}
      >
        <PsychologyAltIcon sx={{ fontSize: 'inherit', marginRight: '8px' }} />
        AIからのアドバイス
      </Typography>
      <Box className="markdown-body" sx={{ 
        maxHeight: isMobile ? '300px' : '400px',
        overflowY: 'auto',
        padding: '0 8px',
        '&::-webkit-scrollbar': {
          width: isMobile ? '4px' : '8px',
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
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'flex-end', 
        marginTop: '16px', 
        alignItems: 'center',
        gap: isMobile ? 1 : 0
      }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="追加の質問をする"
          value={followupQuestion}
          onChange={(e) => setFollowupQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ 
            flexGrow: 1, 
            marginRight: isMobile ? 0 : '8px',
            width: isMobile ? '100%' : 'auto',
          }}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleAskQuestion}
          disabled={!followupQuestion.trim()}
          sx={{ 
            minWidth: 'auto',
            width: isMobile ? '100%' : 'auto',
            marginTop: isMobile ? 1 : 0
          }}
        >
          送信
        </Button>
      </Box>
    </Box>
  );
}

export default AISection;
