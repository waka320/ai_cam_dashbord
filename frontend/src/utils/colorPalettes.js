// src/utils/colorPalettes.js
export const COLOR_PALETTE_NAMES = {
    GREEN_TO_RED: '緑→赤',
    BLUE_TO_RED: '青→赤',
    VIRIDIS: 'Viridis',
    VIRIDIS_REVERSE: 'Viridis（反転）',
    WHITE_TO_BLUE: '白→青→黒',
    GREEN_YELLOW_RED: '緑→黄→赤',
    GREEN_YELLOW_RED_ALT: '緑→黄→赤(代替)'
  };
  
  // カラーパレットの定義
  export const colorPalettes = {
    // 緑→黄→オレンジ→赤のグラデーション
    [COLOR_PALETTE_NAMES.GREEN_TO_RED]: (congestion) => {
      if (congestion === 1) return '#e8f5e9'; // 非常に薄い緑
      if (congestion === 2) return '#c8e6c9'; // 薄い緑
      if (congestion === 3) return '#a5d6a7'; // 明るい緑
      if (congestion === 4) return '#fff59d'; // 黄色
      if (congestion === 5) return '#ffe082'; // 薄いオレンジ
      if (congestion === 6) return '#ffcc80'; // オレンジ
      if (congestion === 7) return '#ffab91'; // 薄い赤オレンジ
      if (congestion === 8) return '#ef9a9a'; // 薄い赤
      if (congestion === 9) return '#e57373'; // 中間の赤
      if (congestion === 10) return '#ef5350'; // 濃い赤
      return '#FFF';
    },
    
    // 青→赤のグラデーション
    [COLOR_PALETTE_NAMES.BLUE_TO_RED]: (congestion) => {
      if (congestion === 1) return '#699ecd';
      if (congestion === 2) return '#83add5';
      if (congestion === 3) return '#9bbfe1';
      if (congestion === 4) return '#b3d1eb';
      if (congestion === 5) return '#cfe4f0';
      if (congestion === 6) return '#fbcacc';
      if (congestion === 7) return '#fa9699';
      if (congestion === 8) return '#f97884';
      if (congestion === 9) return '#f67a80';
      if (congestion === 10) return '#f0545c';
      return '#FFF';
    },
    
    // Viridisパレット
    [COLOR_PALETTE_NAMES.VIRIDIS]: (congestion) => {
      if (congestion === 1) return '#440154'; // 暗い紫
      if (congestion === 2) return '#482878'; // 紫
      if (congestion === 3) return '#3e4989'; // 青紫
      if (congestion === 4) return '#31688e'; // 青
      if (congestion === 5) return '#26828e'; // 青緑
      if (congestion === 6) return '#1f9e89'; // 緑青
      if (congestion === 7) return '#35b779'; // 緑
      if (congestion === 8) return '#6ece58'; // 黄緑
      if (congestion === 9) return '#b5de2b'; // 明るい黄緑
      if (congestion === 10) return '#fde725'; // 黄色
      return '#FFF';
    },
    
    // Viridisパレット（反転）
    [COLOR_PALETTE_NAMES.VIRIDIS_REVERSE]: (congestion) => {
      if (congestion === 1) return '#fde725'; // 黄色
      if (congestion === 2) return '#b5de2b'; // 明るい黄緑
      if (congestion === 3) return '#6ece58'; // 黄緑
      if (congestion === 4) return '#35b779'; // 緑
      if (congestion === 5) return '#1f9e89'; // 緑青
      if (congestion === 6) return '#26828e'; // 青緑
      if (congestion === 7) return '#31688e'; // 青
      if (congestion === 8) return '#3e4989'; // 青紫
      if (congestion === 9) return '#482878'; // 紫
      if (congestion === 10) return '#440154'; // 暗い紫
      return '#FFF';
    },
    
    // 白→青→黒のグラデーション
    [COLOR_PALETTE_NAMES.WHITE_TO_BLUE]: (congestion) => {
      switch (congestion) {
        case 10: return '#000000'; // 黒
        case 9: return '#001433'; // 黒寄りの深い青
        case 8: return '#002766'; // 深い青
        case 7: return '#003A99'; // 濃い青
        case 6: return '#004DCC'; // 鮮やかな青
        case 5: return '#4A69BD'; // 中間青
        case 4: return '#7F8EBE'; // 淡い青
        case 3: return '#B0C4DE'; // 明るい青
        case 2: return '#D0E0F0'; // 非常に淡い青
        case 1: return '#FFFFFF'; // 白
        default: return '#FFF'; // デフォルト
      }
    },
    
    // 新しい緑→黄→赤のグラデーション
    [COLOR_PALETTE_NAMES.GREEN_YELLOW_RED]: (congestion) => {
      if (congestion === 1) return '#e8f5e9'; // 非常に薄い緑
      if (congestion === 2) return '#c8e6c9'; // 薄い緑
      if (congestion === 3) return '#a5d6a7'; // 明るい緑
      if (congestion === 4) return '#fff59d'; // 黄色
      if (congestion === 5) return '#ffe082'; // 薄いオレンジ
      if (congestion === 6) return '#ffcc80'; // オレンジ
      if (congestion === 7) return '#ffab91'; // 薄い赤オレンジ
      if (congestion === 8) return '#ef9a9a'; // 薄い赤
      if (congestion === 9) return '#e57373'; // 中間の赤
      if (congestion === 10) return '#ef5350'; // 濃い赤
      return '#FFF';
    },
    
    // 緑→黄→赤の代替グラデーション
    [COLOR_PALETTE_NAMES.GREEN_YELLOW_RED_ALT]: (congestion) => {
      if (congestion === 1) return '#f1f8e9'; // 非常に明るい緑
      if (congestion === 2) return '#dcedc8'; // 明るい緑
      if (congestion === 3) return '#c5e1a5'; // 中程度の緑
      if (congestion === 4) return '#aed581'; // やや暗い緑
      if (congestion === 5) return '#fff176'; // 明るい黄色
      if (congestion === 6) return '#ffd54f'; // 暗い黄色
      if (congestion === 7) return '#ffb74d'; // オレンジ
      if (congestion === 8) return '#ff8a65'; // 明るい赤
      if (congestion === 9) return '#e57373'; // 中程度の赤
      if (congestion === 10) return '#d32f2f'; // 暗い赤
      return '#FFF';
    }
  };
