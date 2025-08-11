import React from 'react';
import PropTypes from 'prop-types';
import { Box, Modal, IconButton } from '@mui/material';

function CameraModal({ open, onClose, isMobile }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="camera-image-modal"
      aria-describedby="camera-places-image"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          maxWidth: isMobile ? '95vw' : '80vw',
          maxHeight: isMobile ? '90vh' : '85vh',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          outline: 'none',
        }}
      >
        {/* 閉じるボタン */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            zIndex: 1,
            fontSize: '18px',
            fontWeight: 'bold',
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          ✕
        </IconButton>
        
        {/* カメラ画像 */}
        <Box
          component="img"
          src="/assets/camera_places.png"
          alt="カメラの設置場所"
          sx={{
            width: '100%',
            height: 'auto',
            maxHeight: isMobile ? '85vh' : '75vh',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </Box>
    </Modal>
  );
}

CameraModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default CameraModal;
