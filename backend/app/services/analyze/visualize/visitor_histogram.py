import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import japanize_matplotlib  # 日本語表示対応
import os
import glob
from datetime import datetime
import seaborn as sns
from matplotlib.colors import LinearSegmentedColormap

def create_histograms(input_dir, output_dir):
    """
    処理済みの訪問者データからヒストグラムを作成する関数
    """
    # 出力ディレクトリが存在しない場合は作成
    os.makedirs(output_dir, exist_ok=True)
    
    # グラフタイプ別のサブディレクトリを作成
    graph_dirs = {
        'basic': os.path.join(output_dir, 'basic'),
        'weekday': os.path.join(output_dir, 'weekday'),
        'weather': os.path.join(output_dir, 'weather'),
        'events': os.path.join(output_dir, 'events'),
        'temperature': os.path.join(output_dir, 'temperature'),
        'daylight': os.path.join(output_dir, 'daylight')
    }
    
    # 各サブディレクトリを作成
    for dir_path in graph_dirs.values():
        os.makedirs(dir_path, exist_ok=True)
    
    # 入力ディレクトリからCSVファイルを検索
    csv_files = glob.glob(os.path.join(input_dir, "result_*.csv"))
    
    if not csv_files:
        print(f"入力ディレクトリ {input_dir} に処理済みCSVファイルが見つかりませんでした。")
        return
    
    print(f"{len(csv_files)}個のCSVファイルからヒストグラムを作成します...")
    
    # 各CSVファイルを処理
    for csv_file in csv_files:
        filename = os.path.basename(csv_file)
        base_name = filename.replace("result_", "").replace(".csv", "")
        
        print(f"\n処理中: {filename}")
        
        # CSVファイルを読み込む
        df = pd.read_csv(csv_file)
        
        # 基本統計情報を出力
        print(f"データ概要: {len(df)}行, 平均訪問者数: {df['人数'].mean():.1f}人")
        
        # 100人単位の階級を作成
        max_visitors = df['人数'].max()
        min_visitors = df['人数'].min()
        bin_size = 200
        bins = np.arange(0, max_visitors + bin_size + 1, bin_size)
        
        # ----- シンプルなヒストグラム -----
        plt.figure(figsize=(10, 6))
        
        # より鮮明な色を使用
        hist_color = '#3498db'  # 青色
        
        # ヒストグラムの作成
        n, bins, patches = plt.hist(df['人数'], bins=bins, edgecolor='black', 
                                   alpha=0.8, color=hist_color)
        
        # タイトルと軸ラベルの設定
        plt.title(f"訪問者数の分布 ({base_name})", fontsize=16)
        plt.xlabel('訪問者数 (人)', fontsize=14)
        plt.ylabel('日数', fontsize=14)
        plt.xticks(bins)
        plt.grid(axis='y', linestyle='--', alpha=0.7)
        
        # ファイルとして保存
        output_file = os.path.join(graph_dirs['basic'], f"{base_name}.png")
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"基本ヒストグラム: {output_file}")
        
        # ----- 曜日別の色分けヒストグラム -----
        plt.figure(figsize=(12, 7))
        
        # より鮮明な曜日別の色を使用
        weekday_colors = {
            '月': '#3498db',  # 濃い青
            '火': '#e74c3c',  # 濃い赤
            '水': '#2ecc71',  # 濃い緑
            '木': '#f1c40f',  # 濃い黄
            '金': '#9b59b6',  # 濃い紫
            '土': '#e67e22',  # オレンジ
            '日': '#c0392b'   # 暗赤
        }
        
        # 曜日ごとに分けてヒストグラムを作成
        for weekday, color in weekday_colors.items():
            weekday_data = df[df['曜日'] == weekday]
            if not weekday_data.empty:
                plt.hist(weekday_data['人数'], bins=bins, edgecolor='black', 
                         alpha=0.75, label=f'{weekday}曜日 ({len(weekday_data)}日)',
                         color=color)
        
        plt.title(f"曜日別の訪問者数分布 ({base_name})", fontsize=16)
        plt.xlabel('訪問者数 (人)', fontsize=14)
        plt.ylabel('日数', fontsize=14)
        plt.xticks(bins)
        plt.grid(axis='y', linestyle='--', alpha=0.7)
        plt.legend()
        
        output_file = os.path.join(graph_dirs['weekday'], f"{base_name}.png")
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"曜日別ヒストグラム: {output_file}")
        
        # ----- 天気別の色分けヒストグラム -----
        plt.figure(figsize=(14, 8))
        
        # 天気の種類を取得
        weather_types = df['天気'].unique()
        
        # より鮮明な天気ごとの色を設定
        weather_colors = {
            '晴': '#f39c12',    # オレンジ (晴れ)
            '曇': '#7f8c8d',    # 濃いグレー (曇り)
            '雨': '#3498db',    # 濃い青 (雨)
            '雪': '#ecf0f1',    # 白に近いグレー (雪)
            '不明': '#2c3e50',  # 暗い青グレー (不明)
        }
        
        # 実際の天気データから色マップを作成
        actual_weather_colors = {}
        for weather in weather_types:
            for key in weather_colors:
                if key in weather:
                    actual_weather_colors[weather] = weather_colors[key]
                    break
            if weather not in actual_weather_colors:
                actual_weather_colors[weather] = '#2c3e50'  # デフォルト色
        
        # 天気ごとに分けてヒストグラムを作成
        for weather, color in actual_weather_colors.items():
            weather_data = df[df['天気'] == weather]
            if not weather_data.empty:
                plt.hist(weather_data['人数'], bins=bins, edgecolor='black', 
                         alpha=0.75, label=f'{weather} ({len(weather_data)}日)',
                         color=color)
        
        plt.title(f"天気別の訪問者数分布 ({base_name})", fontsize=16)
        plt.xlabel('訪問者数 (人)', fontsize=14)
        plt.ylabel('日数', fontsize=14)
        plt.xticks(bins)
        plt.grid(axis='y', linestyle='--', alpha=0.7)
        plt.legend()
        
        output_file = os.path.join(graph_dirs['weather'], f"{base_name}.png")
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"天気別ヒストグラム: {output_file}")
        
        # ----- イベント有無別のヒストグラム -----
        plt.figure(figsize=(12, 7))
        
        # イベント有無を判定
        df['高山イベントあり'] = df['高山イベント'].str.len() > 0
        df['国民的イベントあり'] = df['国民的イベント'].str.len() > 0
        
        # より鮮明なイベントカテゴリの色
        event_categories = {
            '高山イベントあり': '#e74c3c',     # 濃い赤
            '国民的イベントあり': '#3498db',   # 濃い青
            'イベントなし': '#7f8c8d'          # 暗いグレー
        }
        
        # イベントなしのデータ
        no_event_data = df[~df['高山イベントあり'] & ~df['国民的イベントあり']]
        if not no_event_data.empty:
            plt.hist(no_event_data['人数'], bins=bins, edgecolor='black', 
                     alpha=0.75, label=f'イベントなし ({len(no_event_data)}日)',
                     color=event_categories['イベントなし'])
        
        # 高山イベントありのデータ
        takayama_event_data = df[df['高山イベントあり']]
        if not takayama_event_data.empty:
            plt.hist(takayama_event_data['人数'], bins=bins, edgecolor='black', 
                     alpha=0.75, label=f'高山イベントあり ({len(takayama_event_data)}日)',
                     color=event_categories['高山イベントあり'])
        
        # 国民的イベントありのデータ (高山イベントがあるものを除く)
        national_event_data = df[~df['高山イベントあり'] & df['国民的イベントあり']]
        if not national_event_data.empty:
            plt.hist(national_event_data['人数'], bins=bins, edgecolor='black', 
                     alpha=0.75, label=f'国民的イベントあり ({len(national_event_data)}日)',
                     color=event_categories['国民的イベントあり'])
        
        plt.title(f"イベント有無別の訪問者数分布 ({base_name})", fontsize=16)
        plt.xlabel('訪問者数 (人)', fontsize=14)
        plt.ylabel('日数', fontsize=14)
        plt.xticks(bins)
        plt.grid(axis='y', linestyle='--', alpha=0.7)
        plt.legend()
        
        output_file = os.path.join(graph_dirs['events'], f"{base_name}.png")
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"イベント別ヒストグラム: {output_file}")
        
        # ----- 気温ヒートマップと訪問者数の関係 -----
        plt.figure(figsize=(14, 10))
        
        try:
            # NaN値や非文字列値を考慮して安全に変換
            df['最高気温_数値'] = pd.to_numeric(df['最高気温'].astype(str).str.replace('℃', ''), errors='coerce')
            df['最低気温_数値'] = pd.to_numeric(df['最低気温'].astype(str).str.replace('℃', ''), errors='coerce')
            
            # NaN値を除外
            temp_df = df.dropna(subset=['最高気温_数値', '最低気温_数値'])
            
            if len(temp_df) > 0:
                # 気温と訪問者数の散布図 - より鮮明なカラーマップを使用
                scatter = plt.scatter(temp_df['最高気温_数値'], temp_df['最低気温_数値'], 
                          c=temp_df['人数'], cmap='plasma', 
                          s=100, alpha=0.75, edgecolor='black')
                
                plt.colorbar(scatter, label='訪問者数')
                plt.title(f"気温と訪問者数の関係 ({base_name})", fontsize=16)
                plt.xlabel('最高気温 (℃)', fontsize=14)
                plt.ylabel('最低気温 (℃)', fontsize=14)
                plt.grid(linestyle='--', alpha=0.7)
                
                output_file = os.path.join(graph_dirs['temperature'], f"{base_name}.png")
                plt.savefig(output_file, dpi=300, bbox_inches='tight')
                plt.close()
                print(f"気温グラフ: {output_file}")
            else:
                print(f"警告: 有効な気温データがないため、気温グラフはスキップします")
                plt.close()
        except Exception as e:
            print(f"エラー: 気温グラフの作成中に問題が発生しました: {e}")
            plt.close()
        
        # ----- 日照時間と訪問者数の関係 -----
        plt.figure(figsize=(12, 6))
        
        try:
            # 日照時間を数値に変換（エラー処理を追加）
            df['日照時間_数値'] = pd.to_numeric(df['日照時間'].astype(str).str.replace('h', ''), errors='coerce')
            
            # NaN値を除外
            daylight_df = df.dropna(subset=['日照時間_数値'])
            
            if len(daylight_df) > 0:
                # 曜日ごとの色とマーカーを改善
                weekday_styles = {
                    '月': {'marker': 'o', 'color': '#3498db'},  # 青
                    '火': {'marker': 's', 'color': '#e74c3c'},  # 赤
                    '水': {'marker': '^', 'color': '#2ecc71'},  # 緑
                    '木': {'marker': 'D', 'color': '#f1c40f'},  # 黄
                    '金': {'marker': 'p', 'color': '#9b59b6'},  # 紫
                    '土': {'marker': '*', 'color': '#e67e22'},  # オレンジ
                    '日': {'marker': 'X', 'color': '#c0392b'}   # 暗赤
                }
                
                # 各曜日ごとにプロット
                for weekday, style in weekday_styles.items():
                    weekday_data = daylight_df[daylight_df['曜日'] == weekday]
                    if not weekday_data.empty:
                        plt.scatter(weekday_data['日照時間_数値'], weekday_data['人数'], 
                                   marker=style['marker'], color=style['color'],
                                   s=80, alpha=0.75, edgecolor='black', 
                                   label=f'{weekday}曜日')
                
                plt.title(f"日照時間と訪問者数の関係 ({base_name})", fontsize=16)
                plt.xlabel('日照時間 (時間)', fontsize=14)
                plt.ylabel('訪問者数 (人)', fontsize=14)
                plt.grid(linestyle='--', alpha=0.7)
                plt.legend()
                
                output_file = os.path.join(graph_dirs['daylight'], f"{base_name}.png")
                plt.savefig(output_file, dpi=300, bbox_inches='tight')
                plt.close()
                print(f"日照時間グラフ: {output_file}")
            else:
                print(f"警告: 有効な日照時間データがないため、日照時間グラフはスキップします")
                plt.close()
        except Exception as e:
            print(f"エラー: 日照時間グラフの作成中に問題が発生しました: {e}")
            plt.close()

    print("\nすべてのヒストグラム作成が完了しました")
    print(f"結果は以下のディレクトリに保存されました:\n{output_dir}")
    print("各グラフタイプ別のディレクトリ:")
    for name, path in graph_dirs.items():
        print(f"- {name}: {path}")

if __name__ == "__main__":
    input_dir = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/weather/output"
    output_dir = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/weather/visualize"
    
    create_histograms(input_dir, output_dir)
