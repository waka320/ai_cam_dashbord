// src/contexts/ColorPaletteContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  colorPalettes, 
  COLOR_PALETTE_NAMES, 
  TEXT_COLOR_SETTINGS,
} from '../utils/colorPalettes';

// デフォルトのカラーパレット - キー名を使用
const DEFAULT_PALETTE = 'GREEN_YELLOW_RED';

// ローカルストレージのキー
const STORAGE_KEY = 'dashboard_color_palette';

// コンテキストの作成
const ColorPaletteContext = createContext();

// カスタムフックの作成
export const useColorPalette = () => {
  const context = useContext(ColorPaletteContext);
  if (!context) {
    throw new Error('useColorPalette must be used within a ColorPaletteProvider');
  }
  return context;
};

// プロバイダーコンポーネント
export const ColorPaletteProvider = ({ children }) => {
  // ローカルストレージから保存されたパレットを読み込むか、デフォルトを使用
  const [currentPalette, setCurrentPalette] = useState(() => {
    try {
      const savedPalette = localStorage.getItem(STORAGE_KEY);
      console.log('読み込まれたパレット:', savedPalette);
      
      // 保存されたパレットが有効なキーかチェック
      if (savedPalette && Object.keys(COLOR_PALETTE_NAMES).includes(savedPalette)) {
        return savedPalette;
      }
      return DEFAULT_PALETTE;
    } catch (error) {
      console.error('パレット読み込みエラー:', error);
      return DEFAULT_PALETTE;
    }
  });
  
  // デバッグ: マウント時に現在のパレット情報を表示
  useEffect(() => {
    console.log('現在のパレット:', currentPalette);
    console.log('パレット表示名:', COLOR_PALETTE_NAMES[currentPalette]);
    
    // サンプルカラーの表示
    const colors = [];
    for (let i = 1; i <= 10; i++) {
      colors.push(`混雑度 ${i}: ${colorPalettes[COLOR_PALETTE_NAMES[currentPalette]](i)}`);
    }
    console.log('カラーサンプル:', colors);
  }, [currentPalette]);
  
  // 現在選択されているパレット関数を取得
  const getCellColor = (congestion) => {
    // 混雑度が有効範囲内か確認
    if (!congestion || isNaN(congestion) || congestion < 1 || congestion > 10) {
      return '#FFF';
    }
    
    try {
      const displayName = COLOR_PALETTE_NAMES[currentPalette];
      return colorPalettes[displayName](congestion);
    } catch (error) {
      console.error('色の取得に失敗:', error);
      return '#FFF';
    }
  };
  
  // 混雑度に基づいてテキストの色を決定する関数
  const getTextColor = (congestion) => {
    // 無効な混雑度または混雑度0の場合は灰色テキスト
    if (!congestion || congestion === 0) {
      return '#666';
    }
    
    // 現在のパレットのテキスト色設定を取得
    const settings = TEXT_COLOR_SETTINGS[currentPalette] || { threshold: 6, inverted: false };
    
    // 反転パターンに対応
    if (settings.inverted) {
      // 反転パターン: 閾値未満が白、閾値以上が黒
      return congestion < settings.threshold ? '#fff' : 'inherit';
    } else {
      // 通常パターン: 閾値未満が黒、閾値以上が白
      return congestion >= settings.threshold ? '#fff' : 'inherit';
    }
  };
  
  // カラーパレットを切り替える関数
  const changePalette = (paletteKey) => {
    if (Object.keys(COLOR_PALETTE_NAMES).includes(paletteKey)) {
      console.log(`パレット切り替え: ${currentPalette} → ${paletteKey}`);
      setCurrentPalette(paletteKey);
      
      try {
        localStorage.setItem(STORAGE_KEY, paletteKey);
      } catch (error) {
        console.error('パレット保存エラー:', error);
      }
    } else {
      console.error(`無効なパレットキー: ${paletteKey}`);
    }
  };
  
  // パレットのサンプルデータを生成
  const availablePalettes = Object.keys(COLOR_PALETTE_NAMES).map(key => {
    const displayName = COLOR_PALETTE_NAMES[key];
    const textSettings = TEXT_COLOR_SETTINGS[key] || { threshold: 6, inverted: false };
    
    return {
      id: key,
      name: displayName,
      sample: Array.from({ length: 10 }, (_, i) => {
        try {
          return colorPalettes[displayName](i + 1);
        } catch (error) {
          console.error(`サンプル色取得エラー: ${key}, ${i+1}`, error);
          return '#FFF';
        }
      }),
      textThreshold: textSettings.threshold,
      inverted: textSettings.inverted
    };
  });
  
  const value = {
    currentPalette,
    changePalette,
    getCellColor,
    getTextColor,
    availablePalettes
  };
  
  return (
    <ColorPaletteContext.Provider value={value}>
      {children}
    </ColorPaletteContext.Provider>
  );
};

ColorPaletteProvider.propTypes = {
  children: PropTypes.node.isRequired
};
