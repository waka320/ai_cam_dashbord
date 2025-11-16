// src/utils/colorPalettes.js

// パレット名の定義
export const COLOR_PALETTE_NAMES = {
    TAKAYAMA_DEEP_GRADIENT: 'デフォルト',
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
    mode: 'range',
    blackRanges: [[1, 20]]
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
  TAKAYAMA_DEEP_GRADIENT: {
    mode: 'range',
    whiteRanges: [[1, 6], [18, 20]]
  },

};

// カラーパレットの定義
const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHex = ({ r, g, b }) => {
  const toHex = (value) => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
};

const interpolateColor = (start, end, t) => {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);
  const clamp = (value) => Math.min(255, Math.max(0, Math.round(value)));
  return rgbToHex({
    r: clamp(startRgb.r + (endRgb.r - startRgb.r) * t),
    g: clamp(startRgb.g + (endRgb.g - startRgb.g) * t),
    b: clamp(startRgb.b + (endRgb.b - startRgb.b) * t),
  });
};

const extendPalette = (baseColors, targetLength = 20) => {
  if (baseColors.length === targetLength) {
    return baseColors.slice();
  }

  const result = [];
  const segments = baseColors.length - 1;

  for (let i = 0; i < targetLength; i += 1) {
    const position = i / (targetLength - 1);
    const scaled = position * segments;
    const lowerIndex = Math.floor(scaled);
    const upperIndex = Math.min(segments, Math.ceil(scaled));
    const ratio = scaled - lowerIndex;

    if (lowerIndex === upperIndex) {
      result.push(baseColors[lowerIndex]);
    } else {
      result.push(interpolateColor(baseColors[lowerIndex], baseColors[upperIndex], ratio));
    }
  }

  return result;
};

const createPaletteFunction = (baseColors) => {
  const extended = extendPalette(baseColors, 20);
  return (congestion) => {
    const level = Number(congestion);
    if (Number.isNaN(level) || level <= 0) {
      return '#FFF';
    }
    const index = Math.min(Math.max(Math.round(level), 1), extended.length) - 1;
    return extended[index] ?? '#FFF';
  };
};

const BASE_PALETTES = {
  [COLOR_PALETTE_NAMES.GREEN_YELLOW_RED_ONE]: ['#e4f6d7', '#eff6be', '#f9f5a6', '#ffee90', '#ffd069', '#ffbd50', '#feac42', '#f98345', '#f66846', '#f25444'],
  [COLOR_PALETTE_NAMES.GREEN_TO_RED]: ['#e8f5e9', '#c8e6c9', '#a5d6a7', '#fff59d', '#ffe082', '#ffcc80', '#ffab91', '#ef9a9a', '#e57373', '#ef5350'],
  [COLOR_PALETTE_NAMES.BLUE_TO_RED]: ['#699ecd', '#83add5', '#9bbfe1', '#b3d1eb', '#cfe4f0', '#fbcacc', '#fa9699', '#f97884', '#f67a80', '#f0545c'],
  [COLOR_PALETTE_NAMES.VIRIDIS]: ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'],
  [COLOR_PALETTE_NAMES.VIRIDIS_REVERSE]: ['#fde725', '#b5de2b', '#6ece58', '#35b779', '#1f9e89', '#26828e', '#31688e', '#3e4989', '#482878', '#440154'],
  [COLOR_PALETTE_NAMES.WHITE_TO_BLUE]: ['#ffffff', '#d0e0f0', '#b0c4de', '#7f8ebe', '#4a69bd', '#004dcc', '#003a99', '#002766', '#001433', '#000000'],
  [COLOR_PALETTE_NAMES.GREEN_YELLOW_RED]: ['#f9f1dc', '#e1ed8a', '#ffee90', '#ffdd50', '#ffd069', '#f6ac0c', '#f28b06', '#e35911', '#d84b35', '#c61a1a'],
  [COLOR_PALETTE_NAMES.PASTELE_ONE]: ['#f8fcff', '#ddf2fd', '#aed6f4', '#c8eabb', '#ffeb88', '#ffdf57', '#ffc271', '#f49758', '#f48678', '#d85645'],
  [COLOR_PALETTE_NAMES.PASTELE_TWO]: ['#a3cbef', '#a9dbeb', '#b0dd9f', '#e1ed8a', '#ffeb88', '#fcd170', '#ffc271', '#f49758', '#f48678', '#d85645'],
  [COLOR_PALETTE_NAMES.PASTELE_THREE]: ['#4457a5', '#77beed', '#b0e5ff', '#a3e09b', '#d9f0a3', '#fee08b', '#ffb061', '#ff704a', '#ea3f28', '#c61a1a'],
  [COLOR_PALETTE_NAMES.WHITE_RED]: ['#fcf7eb', '#fff1b6', '#fee666', '#ffd110', '#ffbc00', '#ff9d00', '#f27111', '#d3542d', '#c61a1a', '#9e2e2e'],
  [COLOR_PALETTE_NAMES.RDYLBU_R]: ['#053061', '#2166ac', '#4393c3', '#92c5de', '#d1e5f0', '#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'],
  [COLOR_PALETTE_NAMES.JET]: ['#000080', '#0000ff', '#00bfff', '#00ffff', '#00ff00', '#80ff00', '#ffff00', '#ff8000', '#ff0000', '#800000'],
  [COLOR_PALETTE_NAMES.TURBO]: ['#30123b', '#4067e9', '#26a4f2', '#4ac16d', '#a7d65d', '#fcce2e', '#fb9e24', '#f06b22', '#d93806', '#7a0403'],
  [COLOR_PALETTE_NAMES.GRADS]: ['#000080', '#0000ff', '#0080ff', '#00ffff', '#00ff80', '#00ff00', '#80ff00', '#ffff00', '#ff8000', '#ff0000'],
  [COLOR_PALETTE_NAMES.CMTHERMAL]: ['#000000', '#240000', '#580000', '#8c0000', '#c03b00', '#f07800', '#ffb000', '#ffe060', '#ffff9f', '#ffffff'],
  [COLOR_PALETTE_NAMES.TAKAYAMA_DEEP_GRADIENT]: [
    '#6A64AE', '#5468ad', '#396bb0', '#2b78b0', '#1b86ae',
    '#1db4b3', '#19a28d', '#2ea27f', '#33a65d', '#56a73a',
    '#99d12c', '#cee52f', '#fef32f', '#ffcb21', '#ff9911',
    '#ff6e2c', '#fb4f32', '#fc3633', '#fc3633', '#ed3b6a'
  ],
};

export const colorPalettes = Object.keys(BASE_PALETTES).reduce((acc, key) => {
  acc[key] = createPaletteFunction(BASE_PALETTES[key]);
  return acc;
}, {});

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
