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
from matplotlib.ticker import MaxNLocator

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
        'daylight': os.path.join(output_dir, 'daylight'),
        'kde': os.path.join(output_dir, 'kde'),          # カーネル密度推定用
        'box': os.path.join(output_dir, 'box'),          # ボックスプロット用
        'heatmap': os.path.join(output_dir, 'heatmap'),  # ヒートマップ用
        'facet': os.path.join(output_dir, 'facet')       # ファセットプロット用
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
        
        # ----- KDE (カーネル密度推定) プロット -----
        plt.figure(figsize=(12, 8))
        
        # カラーパレットの設定
        palette = sns.color_palette("husl", 7)
        
        # 曜日ごとの密度プロット
        for i, day in enumerate(['月', '火', '水', '木', '金', '土', '日']):
            day_data = df[df['曜日'] == day]
            if not day_data.empty:
                sns.kdeplot(
                    data=day_data['人数'], 
                    label=f"{day}曜日 ({len(day_data)}日)", 
                    color=palette[i],
                    fill=True, 
                    alpha=0.3,
                    linewidth=2
                )
        
        plt.title(f"曜日別の訪問者数分布 (密度推定) - {base_name}", fontsize=16)
        plt.xlabel('訪問者数 (人)', fontsize=14)
        plt.ylabel('確率密度', fontsize=14)
        plt.grid(linestyle='--', alpha=0.7)
        plt.legend(title="曜日")
        
        output_file = os.path.join(graph_dirs['kde'], f"{base_name}_weekday.png")
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"曜日別密度推定プロット: {output_file}")
        
        # ----- ボックスプロットとバイオリンプロット -----
        plt.figure(figsize=(14, 10))
        
        # サブプロットの設定
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 12), sharex=True)
        
        # ボックスプロット
        sns.boxplot(x='曜日', y='人数', data=df, palette="Set3", ax=ax1, showfliers=False)
        ax1.set_title(f"曜日別の訪問者数分布 (ボックスプロット) - {base_name}", fontsize=16)
        ax1.set_xlabel('')
        ax1.set_ylabel('訪問者数 (人)', fontsize=14)
        ax1.grid(axis='y', linestyle='--', alpha=0.7)
        
        # バイオリンプロット
        sns.violinplot(x='曜日', y='人数', data=df, palette="Set3", 
                      inner="quartile", ax=ax2, scale="width", cut=0)
        ax2.set_title(f"曜日別の訪問者数分布 (バイオリンプロット) - {base_name}", fontsize=16)
        ax2.set_xlabel('曜日', fontsize=14)
        ax2.set_ylabel('訪問者数 (人)', fontsize=14)
        ax2.grid(axis='y', linestyle='--', alpha=0.7)
        
        plt.tight_layout()
        output_file = os.path.join(graph_dirs['box'], f"{base_name}_weekday.png")
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"曜日別ボックス＆バイオリンプロット: {output_file}")
        
        # ----- イベント種類別のボックスプロット -----
        # イベント種別を追加
        df['イベント種別'] = 'イベントなし'
        df.loc[df['高山イベント'].str.len() > 0, 'イベント種別'] = '高山イベントあり'
        df.loc[(df['国民的イベント'].str.len() > 0) & (df['高山イベント'].str.len() == 0), 'イベント種別'] = '国民的イベントのみ'
        
        plt.figure(figsize=(12, 8))
        sns.boxplot(x='イベント種別', y='人数', data=df, palette="Set2", showfliers=False)
        plt.title(f"イベント種別ごとの訪問者数分布 - {base_name}", fontsize=16)
        plt.xlabel('イベント種別', fontsize=14)
        plt.ylabel('訪問者数 (人)', fontsize=14)
        plt.grid(axis='y', linestyle='--', alpha=0.7)
        
        output_file = os.path.join(graph_dirs['box'], f"{base_name}_events.png")
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"イベント種別ボックスプロット: {output_file}")
        
        # ----- 気温と訪問者数のヒートマップ -----
        try:
            # NaN値や非文字列値を考慮して安全に変換
            df['最高気温_数値'] = pd.to_numeric(df['最高気温'].astype(str).str.replace('℃', ''), errors='coerce')
            df['最低気温_数値'] = pd.to_numeric(df['最低気温'].astype(str).str.replace('℃', ''), errors='coerce')
            
            # NaN値を除外
            temp_df = df.dropna(subset=['最高気温_数値', '最低気温_数値'])
            
            if len(temp_df) > 0:
                plt.figure(figsize=(14, 10))
                
                # 六角形ビニングによるヒートマップ
                hb = plt.hexbin(
                    temp_df['最高気温_数値'], 
                    temp_df['最低気温_数値'], 
                    C=temp_df['人数'],
                    gridsize=20,
                    cmap='YlOrRd',
                    reduce_C_function=np.mean,
                    mincnt=1
                )
                
                cb = plt.colorbar(hb, label='平均訪問者数')
                plt.title(f"気温と訪問者数の関係 (ヒートマップ) - {base_name}", fontsize=16)
                plt.xlabel('最高気温 (℃)', fontsize=14)
                plt.ylabel('最低気温 (℃)', fontsize=14)
                plt.grid(linestyle='--', alpha=0.7)
                
                output_file = os.path.join(graph_dirs['heatmap'], f"{base_name}_temp.png")
                plt.savefig(output_file, dpi=300, bbox_inches='tight')
                plt.close()
                print(f"気温ヒートマップ: {output_file}")
            else:
                print(f"警告: 有効な気温データがないため、ヒートマップはスキップします")
        except Exception as e:
            print(f"エラー: 気温ヒートマップの作成中に問題が発生しました: {e}")
            plt.close()
        
        # ----- 日照時間と曜日のファセットプロット -----
        try:
            # 日照時間を数値に変換
            df['日照時間_数値'] = pd.to_numeric(df['日照時間'].astype(str).str.replace('h', ''), errors='coerce')
            
            # NaN値を除外
            daylight_df = df.dropna(subset=['日照時間_数値'])
            
            # デバッグ情報を出力
            print(f"日照時間データレコード数: {len(daylight_df)}")
            
            if len(daylight_df) > 0:
                try:
                    print("日照時間データのサンプル:")
                    print(daylight_df[['曜日', '日照時間_数値', '人数']].head())
                    
                    # サブプロットのグリッドを作成 - 代替方法を使用
                    fig, axes = plt.subplots(2, 4, figsize=(16, 10))
                    axes = axes.flatten()
                    
                    # 曜日の順番を設定
                    weekdays = ['月', '火', '水', '木', '金', '土', '日']
                    
                    # 各曜日ごとにサブプロットを作成
                    for idx, day in enumerate(weekdays):
                        if idx < len(axes):  # 配列の範囲内かチェック
                            day_data = daylight_df[daylight_df['曜日'] == day]
                            
                            if not day_data.empty:
                                # 散布図と回帰線をプロット
                                sns.regplot(
                                    x='日照時間_数値', 
                                    y='人数', 
                                    data=day_data,
                                    ax=axes[idx],
                                    scatter_kws={'alpha': 0.6, 's': 50},
                                    line_kws={'color': 'red'}
                                )
                                
                                axes[idx].set_title(f"{day}曜日")
                                axes[idx].grid(True, linestyle='--', alpha=0.7)
                                
                                # 統計情報を表示
                                corr = day_data['日照時間_数値'].corr(day_data['人数'])
                                axes[idx].text(
                                    0.05, 0.95, 
                                    f"相関係数: {corr:.2f}\nデータ数: {len(day_data)}",
                                    transform=axes[idx].transAxes,
                                    verticalalignment='top',
                                    bbox={'boxstyle': 'round', 'facecolor': 'white', 'alpha': 0.8}
                                )
                            else:
                                axes[idx].text(0.5, 0.5, f"{day}曜日のデータなし", 
                                             ha='center', va='center', transform=axes[idx].transAxes)
                                axes[idx].set_title(f"{day}曜日")
                    
                    # 未使用のサブプロットを非表示
                    for idx in range(len(weekdays), len(axes)):
                        axes[idx].set_visible(False)
                    
                    # 共通のx軸とy軸のラベルを設定
                    fig.text(0.5, 0.04, '日照時間 (時間)', ha='center', fontsize=14)
                    fig.text(0.04, 0.5, '訪問者数 (人)', va='center', rotation='vertical', fontsize=14)
                    
                    # 全体のタイトルを設定
                    plt.suptitle(f"曜日別の日照時間と訪問者数の関係 - {base_name}", fontsize=16)
                    plt.tight_layout(rect=[0.05, 0.05, 0.95, 0.95])
                    
                    output_file = os.path.join(graph_dirs['facet'], f"{base_name}_daylight.png")
                    plt.savefig(output_file, dpi=300, bbox_inches='tight')
                    plt.close()
                    print(f"日照時間ファセットプロット: {output_file}")
                    
                    # 別のファセットプロット - ヒートマップを使う
                    plt.figure(figsize=(12, 10))
                    
                    # 曜日と日照時間の関係をヒートマップで可視化
                    pivot_daylight = daylight_df.pivot_table(
                        index='曜日',
                        columns=pd.cut(daylight_df['日照時間_数値'], bins=10),
                        values='人数', 
                        aggfunc='mean'
                    ).fillna(0)
                    
                    # ヒートマップを描画
                    sns.heatmap(
                        pivot_daylight, 
                        cmap='YlGnBu', 
                        annot=True, 
                        fmt='.0f',
                        linewidths=.5
                    )
                    
                    plt.title(f"曜日・日照時間ごとの平均訪問者数 - {base_name}", fontsize=16)
                    plt.xlabel('日照時間 (時間)', fontsize=14)
                    plt.ylabel('曜日', fontsize=14)
                    
                    output_file = os.path.join(graph_dirs['facet'], f"{base_name}_daylight_heatmap.png")
                    plt.savefig(output_file, dpi=300, bbox_inches='tight')
                    plt.close()
                    print(f"日照時間ヒートマップ: {output_file}")
                    
                except Exception as e:
                    print(f"内部エラー: ファセットプロット描画中に例外が発生しました: {e}")
                    plt.close()
            else:
                print(f"警告: 有効な日照時間データがないため、ファセットプロットはスキップします")
        except Exception as e:
            print(f"エラー: ファセットプロットの作成中に問題が発生しました: {e}")
            plt.close()

        # ----- 積み上げ棒グラフによる曜日×天気の訪問者数 -----
        try:
            # 曜日と天気でグループ化して平均訪問者数を計算
            pivot_df = df.groupby(['曜日', '天気'])['人数'].mean().unstack()
            
            # 欠損値を0に置換
            pivot_df = pivot_df.fillna(0)
            
            plt.figure(figsize=(14, 8))
            ax = pivot_df.plot(kind='bar', stacked=True, figsize=(14, 8), 
                              colormap='tab20', edgecolor='black', linewidth=0.5)
            
            plt.title(f"曜日×天気別の平均訪問者数 - {base_name}", fontsize=16)
            plt.xlabel('曜日', fontsize=14)
            plt.ylabel('平均訪問者数 (人)', fontsize=14)
            plt.xticks(rotation=0)
            plt.grid(axis='y', linestyle='--', alpha=0.5)
            plt.legend(title='天気', bbox_to_anchor=(1.05, 1), loc='upper left')
            
            # 各バーの上部に合計値を表示
            for i, total in enumerate(pivot_df.sum(axis=1)):
                ax.text(i, total + 50, f'{total:.0f}', ha='center', fontsize=10, fontweight='bold')
            
            plt.tight_layout()
            output_file = os.path.join(graph_dirs['events'], f"{base_name}_day_weather.png")
            plt.savefig(output_file, dpi=300, bbox_inches='tight')
            plt.close()
            print(f"曜日×天気の積み上げ棒グラフ: {output_file}")
        except Exception as e:
            print(f"エラー: 積み上げ棒グラフの作成中に問題が発生しました: {e}")
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
