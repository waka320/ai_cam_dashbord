// src/utils/colorPalettes.js

// パレット名の定義
export const COLOR_PALETTE_NAMES = {
    GREEN_YELLOW_RED_ONE: '緑→黄→赤',
    GREEN_YELLOW_RED: '白→黄→赤',
    WHITE_RED: '白→赤',
    PASTELE_ONE: 'パステル①',
    PASTELE_TWO: 'パステル②',
    PASTELE_THREE: 'パステル③',
    BLUE_TO_RED: '青→赤',
    VIRIDIS_REVERSE: 'Viridis',
    WHITE_TO_BLUE: '白→青→黒',
    RDYLBU_R: 'RdYlBu（反転）',
    JET: 'jet',
    TURBO: 'turbo',
    GRADS: 'GrADSデフォルト',
    CMTHERMAL: 'cmthermal',
 
};

// テキスト色の設定：閾値とパターン（通常または反転）
export const TEXT_COLOR_SETTINGS = {
  GREEN_YELLOW_RED_ONE: { 
    threshold: 11,      // 6以上で白文字
    inverted: false    // 通常パターン（閾値未満が黒、以上が白）
  },
  GREEN_YELLOW_RED: { 
    threshold: 7,      
    inverted: false
  },
  WHITE_RED: { 
    threshold: 6,      
    inverted: false
  },
  BLUE_TO_RED: { 
    threshold: 11,      
    inverted: true
  },
  VIRIDIS: { 
    threshold: 6,
    inverted: true
  },
  VIRIDIS_REVERSE: { 
    threshold: 6,
    inverted: false    // 反転パターン（閾値未満が白、以上が黒）
  },
  WHITE_TO_BLUE: { 
    threshold: 6,
    inverted: false    // 反転パターン（明るい色は黒文字、暗い色は白文字）
  },
  RDYLBU_R: {
    mode: 'range',
    blackRanges: [[3, 8]]      // 通常パターン
  },
  JET: {
    mode: 'range',
    blackRanges: [[3, 8]]      // 通常パターン
  },
  TURBO: {
    mode: 'range',
    blackRanges: [[3, 8]]     // 通常パターン
  },
  GRADS: {
    mode: 'range',
    blackRanges: [[3, 8]]    // 通常パターン
  },
  CMTHERMAL: {
    threshold: 6,       // 3以上で白文字（暗い部分）
    inverted: true      // 反転パターン（高い混雑度で黒文字）
  },
  PASTELE_ONE: {
    mode: 'range',
    blackRanges: [[3, 8]]      // 通常パターン
  },
  PASTELE_TWO: {
    mode: 'range',
    blackRanges: [[3, 8]]      // 通常パターン
  },
  PASTELE_THREE: {
    mode: 'range',
    blackRanges: [[3, 8]]      // 通常パターン
  },

};

// カラーパレットの定義
export const colorPalettes = {
  [COLOR_PALETTE_NAMES.GREEN_YELLOW_RED_ONE]: (congestion) => {
    if (congestion === 1) return '#e4f6d7'; // 非常に薄い緑
    if (congestion === 2) return '#eff6be'; // 薄い緑
    if (congestion === 3) return '#f9f5a6'; // 明るい緑
    if (congestion === 4) return '#ffee90'; // 黄色
    if (congestion === 5) return '#ffd069'; // 薄いオレンジ
    if (congestion === 6) return '#ffbd50'; // オレンジ
    if (congestion === 7) return '#feac42'; // 薄い赤オレンジ
    if (congestion === 8) return '#f98345'; // 薄い赤
    if (congestion === 9) return '#f66846'; // 中間の赤
    if (congestion === 10) return '#f25444'; // 濃い赤
    return '#FFF';
  },
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
  [COLOR_PALETTE_NAMES.GREEN_YELLOW_RED]: (congestion) => {
    if (congestion === 1) return '#f9f1dc'; 
    if (congestion === 2) return '#e1ed8a'; 
    if (congestion === 3) return '#ffee90'; 
    if (congestion === 4) return '#ffdd50'; 
    if (congestion === 5) return '#ffd069'; 
    if (congestion === 6) return '#f6ac0c'; 
    if (congestion === 7) return '#f28b06'; 
    if (congestion === 8) return '#e35911'; 
    if (congestion === 9) return '#d84b35'; 
    if (congestion === 10) return '#c61a1a';
    return '#FFF';
  },
  [COLOR_PALETTE_NAMES.PASTELE_ONE]: (congestion) => {
    if (congestion === 1) return '#f8fcff'; 
    if (congestion === 2) return '#ddf2fd'; 
    if (congestion === 3) return '#aed6f4'; 
    if (congestion === 4) return '#c8eabb'; 
    if (congestion === 5) return '#ffeb88'; 
    if (congestion === 6) return '#ffdf57'; 
    if (congestion === 7) return '#ffc271'; 
    if (congestion === 8) return '#f49758'; 
    if (congestion === 9) return '#f48678'; 
    if (congestion === 10) return '#d85645';
    return '#FFF';
  },
  [COLOR_PALETTE_NAMES.PASTELE_TWO]: (congestion) => {
    if (congestion === 1) return '#a3cbef'; 
    if (congestion === 2) return '#a9dbeb'; 
    if (congestion === 3) return '#b0dd9f'; 
    if (congestion === 4) return '#e1ed8a'; 
    if (congestion === 5) return '#ffeb88'; 
    if (congestion === 6) return '#fcd170'; 
    if (congestion === 7) return '#ffc271'; 
    if (congestion === 8) return '#f49758'; 
    if (congestion === 9) return '#f48678'; 
    if (congestion === 10) return '#d85645';
    return '#FFF';
  },
  [COLOR_PALETTE_NAMES.PASTELE_THREE]: (congestion) => {
    if (congestion === 1) return '#4457a5'; 
    if (congestion === 2) return '#77beed'; 
    if (congestion === 3) return '#b0e5ff'; 
    if (congestion === 4) return '#a3e09b'; 
    if (congestion === 5) return '#d9f0a3'; 
    if (congestion === 6) return '#fee08b'; 
    if (congestion === 7) return '#ffb061'; 
    if (congestion === 8) return '#ff704a'; 
    if (congestion === 9) return '#ea3f28'; 
    if (congestion === 10) return '#c61a1a';
    return '#FFF';
  },
  [COLOR_PALETTE_NAMES.WHITE_RED]: (congestion) => {
    if (congestion === 1) return '#fcf7eb'; 
    if (congestion === 2) return '#fff1b6'; 
    if (congestion === 3) return '#fee666'; 
    if (congestion === 4) return '#ffd110'; 
    if (congestion === 5) return '#ffbc00'; 
    if (congestion === 6) return '#ff9d00'; 
    if (congestion === 7) return '#f27111'; 
    if (congestion === 8) return '#d3542d'; 
    if (congestion === 9) return '#c61a1a'; 
    if (congestion === 10) return '#9e2e2e';
    return '#FFF';
  },
  [COLOR_PALETTE_NAMES.RDYLBU_R]: (congestion) => {
    if (congestion === 1) return '#053061'; // 濃い青
    if (congestion === 2) return '#2166ac'; // 青
    if (congestion === 3) return '#4393c3'; // 薄い青
    if (congestion === 4) return '#92c5de'; // とても薄い青
    if (congestion === 5) return '#d1e5f0'; // 非常に薄い青
    if (congestion === 6) return '#fddbc7'; // 非常に薄い赤
    if (congestion === 7) return '#f4a582'; // 薄い赤
    if (congestion === 8) return '#d6604d'; // 中間の赤
    if (congestion === 9) return '#b2182b'; // 赤
    if (congestion === 10) return '#67001f'; // 濃い赤
    return '#FFF';
  },
  [COLOR_PALETTE_NAMES.JET]: (congestion) => {
    if (congestion === 1) return '#000080'; // 濃い青
    if (congestion === 2) return '#0000ff'; // 青
    if (congestion === 3) return '#00bfff'; // 明るい青
    if (congestion === 4) return '#00ffff'; // シアン
    if (congestion === 5) return '#00ff00'; // 緑
    if (congestion === 6) return '#80ff00'; // 黄緑
    if (congestion === 7) return '#ffff00'; // 黄
    if (congestion === 8) return '#ff8000'; // オレンジ
    if (congestion === 9) return '#ff0000'; // 赤
    if (congestion === 10) return '#800000'; // 暗い赤
    return '#FFF';
  },
  [COLOR_PALETTE_NAMES.TURBO]: (congestion) => {
    if (congestion === 1) return '#30123b'; // 暗い青紫
    if (congestion === 2) return '#4067e9'; // 青
    if (congestion === 3) return '#26a4f2'; // 明るい青
    if (congestion === 4) return '#4ac16d'; // 青緑
    if (congestion === 5) return '#a7d65d'; // 黄緑
    if (congestion === 6) return '#fcce2e'; // 黄
    if (congestion === 7) return '#fb9e24'; // 明るいオレンジ
    if (congestion === 8) return '#f06b22'; // オレンジ
    if (congestion === 9) return '#d93806'; // 赤
    if (congestion === 10) return '#7a0403'; // 非常に暗い赤
    return '#FFF';
  },
  [COLOR_PALETTE_NAMES.GRADS]: (congestion) => {
    if (congestion === 1) return '#000080'; // 濃い青
    if (congestion === 2) return '#0000ff'; // 青
    if (congestion === 3) return '#0080ff'; // 明るい青
    if (congestion === 4) return '#00ffff'; // シアン
    if (congestion === 5) return '#00ff80'; // 青緑
    if (congestion === 6) return '#00ff00'; // 緑
    if (congestion === 7) return '#80ff00'; // 黄緑
    if (congestion === 8) return '#ffff00'; // 黄
    if (congestion === 9) return '#ff8000'; // オレンジ
    if (congestion === 10) return '#ff0000'; // 赤
    return '#FFF';
  },
  [COLOR_PALETTE_NAMES.CMTHERMAL]: (congestion) => {
    if (congestion === 1) return '#000000'; // 黒
    if (congestion === 2) return '#240000'; // 非常に暗い赤
    if (congestion === 3) return '#580000'; // 暗い赤
    if (congestion === 4) return '#8c0000'; // 赤
    if (congestion === 5) return '#c03b00'; // 明るい赤
    if (congestion === 6) return '#f07800'; // オレンジ
    if (congestion === 7) return '#ffb000'; // 明るいオレンジ
    if (congestion === 8) return '#ffe060'; // 黄色
    if (congestion === 9) return '#ffff9f'; // 明るい黄色
    if (congestion === 10) return '#ffffff'; // 白
    return '#FFF';
  },
  
};

// パレットとテキスト色の設定を一体化したヘルパー関数
export const getPaletteInfo = (paletteKey) => {
  const displayName = COLOR_PALETTE_NAMES[paletteKey];
  const textSettings = TEXT_COLOR_SETTINGS[paletteKey] || { threshold: 6, inverted: false };
  const colorFunction = colorPalettes[displayName];
  
  return {
    key: paletteKey,
    name: displayName,
    textThreshold: textSettings.threshold,
    inverted: textSettings.inverted,
    mode: textSettings.mode,
    whiteRanges: textSettings.whiteRanges,
    blackRanges: textSettings.blackRanges,
    getColor: colorFunction
  };
};
