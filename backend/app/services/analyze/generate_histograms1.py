import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Tuple
import matplotlib
import numpy as np

# 日本語フォントのサポート設定
matplotlib.rcParams['font.family'] = 'Hiragino Sans GB'  # macOSの場合
# WindowsやLinuxの場合は以下のいずれかを試す
# matplotlib.rcParams['font.family'] = 'IPAGothic'  
# matplotlib.rcParams['font.family'] = 'MS Gothic'
# matplotlib.rcParams['font.sans-serif'] = ['IPAGothic', 'MS Gothic', 'Hiragino Sans GB']
matplotlib.rcParams['font.size'] = 12
matplotlib.rcParams['axes.unicode_minus'] = False  # マイナス記号の文字化け対策

# 静的なCONGESTION_THRESHOLDSは保持（フォールバック用）
CONGESTION_THRESHOLDS = {
    # 場所ごとの(min_threshold, max_threshold)を定義
    'honmachi2': (2300, 9500),
    'honmachi3': (1500, 8500),
    'honmachi4': (1000, 10000),
    'jinnya': (700, 7000),
    'kokubunjidori': (1600, 5800),
    'nakabashi': (1600, 7800),
    'omotesando': (700, 7000),
    'yasukawadori': (7000, 26000),
    'yottekan': (300, 3500),
    # デフォルト値
    'default': (2300, 9500)
}

def ensure_directory_exists(directory_path: str):
    """指定されたディレクトリが存在しない場合は作成する"""
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

def count_persons_by_day(csv_file_path: str) -> Tuple[Dict, str, str]:
    """
    CSVファイルから日ごとの人数を集計する
    同じ日の全方向(toEast, toWestなど)の人数を合計する
    
    Returns:
        Tuple[Dict, str, str]: 集計結果の辞書、開始日、終了日
    """
    try:
        # CSVファイルを読み込む
        df = pd.read_csv(csv_file_path)
        
        # 必要なカラムがあることを確認
        required_columns = ['name', 'count_1_hour']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            print(f"Warning: Missing columns in {csv_file_path}: {missing_columns}")
            return {}, "", ""
        
        # 日付カラムを探す
        date_column = None
        for col in ['date_jst', 'datetime_jst']:
            if col in df.columns:
                date_column = col
                break
                
        if not date_column:
            print(f"Warning: No date column found in {csv_file_path}")
            return {}, "", ""
        
        # 日付カラムをdatetimeに変換
        df[date_column] = pd.to_datetime(df[date_column])
        
        # 日付部分のみ抽出
        df['date_only'] = df[date_column].dt.date
        
        # 'person'の人数を日ごとにグループ化して合計
        person_df = df[df['name'] == 'person']
        daily_count = person_df.groupby('date_only')['count_1_hour'].sum()
        
        # データ期間を取得
        start_date = person_df['date_only'].min().strftime('%Y/%m/%d') if not person_df.empty else ""
        end_date = person_df['date_only'].max().strftime('%Y/%m/%d') if not person_df.empty else ""
        
        # 辞書形式に変換して返す
        return {date: count for date, count in daily_count.items()}, start_date, end_date
        
    except Exception as e:
        print(f"Error processing {csv_file_path}: {e}")
        return {}, "", ""

def calculate_congestion_bins(place: str, data: pd.DataFrame) -> Tuple[list, str]:
    """
    データに基づいて混雑度の境界値を計算する
    要件:
    1. CONGESTION_THRESHOLDSから混雑度1,2の境界値と9,10の境界値を取得
    2. 全データの平均値を計算し、混雑度5,6の境界値とする
    3. (混雑度5,6の境界値 - 混雑度1,2の境界値) / 4 で混雑度2,3、3,4、4,5の境界値を計算
    4. (混雑度9,10の境界値 - 混雑度5,6の境界値) / 4 で混雑度6,7、7,8、8,9の境界値を計算
    """
    # CONGESTION_THRESHOLDSから境界値を取得
    min_threshold, max_threshold = CONGESTION_THRESHOLDS.get(place, CONGESTION_THRESHOLDS['default'])
    
    # データが空の場合は等間隔の境界値を使用
    if data.empty:
        step = (max_threshold - min_threshold) / 8
        bins = [0, min_threshold]
        for i in range(1, 8):
            bins.append(min_threshold + step * i)
        bins.append(max_threshold)
        bins.append(max_threshold * 10)  # 十分大きな値
        title = f"{place} - 混雑度分布 (デフォルト境界値使用)"
        return bins, title
    
    # データから平均値を計算（混雑度5,6の境界値）
    counts = data['count_1_hour'].values
    middle_threshold = sum(counts) / len(counts)
    
    # 混雑度1,2〜5,6の間の段階的な境界値を計算
    step_lower = (middle_threshold - min_threshold) / 4
    
    # 混雑度5,6〜9,10の間の段階的な境界値を計算
    step_upper = (max_threshold - middle_threshold) / 4
    
    # 境界値のリストを作成
    bins = [0]  # 最小値（混雑度1の下限）
    bins.append(min_threshold)  # 混雑度1,2の境界
    
    # 混雑度2,3、3,4、4,5の境界値
    for i in range(1, 4):
        bins.append(min_threshold + i * step_lower)
    
    # 混雑度5,6の境界値
    bins.append(middle_threshold)
    
    # 混雑度6,7、7,8、8,9の境界値
    for i in range(1, 4):
        bins.append(middle_threshold + i * step_upper)
    
    # 混雑度9,10の境界値
    bins.append(max_threshold)
    
    # 最後に最大値をはるかに超える値を追加（データの最大値の1.5倍か、max_thresholdの10倍のいずれか大きい方）
    max_val = max(counts)
    bins.append(max(max_val * 1.5, max_threshold * 10))
    
    title = f"{place} - 混雑度分布 (混雑度1,2境界値: {min_threshold}, 混雑度9,10境界値: {max_threshold})"
    return bins, title

def create_histogram(file_path: str, place: str, output_dir: str):
    """指定した場所のデータを使って混雑度のヒストグラムを作成する"""
    # 日ごとの歩行者数を取得
    daily_counts_dict, start_date, end_date = count_persons_by_day(file_path)
    
    if not daily_counts_dict:
        print(f"データが取得できませんでした: {file_path}")
        return
    
    # 辞書からDataFrameに変換
    daily_counts = pd.DataFrame([
        {"datetime_jst": date, "count_1_hour": count} 
        for date, count in daily_counts_dict.items()
    ])
    
    # データに基づいて混雑度の境界値を計算
    bins, title_base = calculate_congestion_bins(place, daily_counts)
    
    # タイトルにデータ期間を追加
    title = f"{place} - 混雑度分布 ({start_date} - {end_date})"
    
    # 最大値を確認してbinsを調整
    max_count = daily_counts['count_1_hour'].max() if not daily_counts.empty else 0
    print(f"{place}の最大歩行者数: {max_count}")
    
    # 最大値が最後のbin（混雑度10の下限）より大きい場合は、最後のbinを調整
    if max_count > bins[-2]:
        # 最後のbinを最大値より少し大きい値に設定
        bins[-1] = max_count * 1.1  # 最大値より10%大きい値
    
    # ヒストグラムを描画して度数を取得（この時点ではまだプロットしない）
    n, bins_result = np.histogram(daily_counts['count_1_hour'], bins=bins)
    
    # 混雑度レベルごとの人数境界値と度数を標準出力に表示
    print(f"\n■ {place} の混雑度レベルごとの人数境界値と度数:")
    for i in range(10):
        if i == 9:
            print(f"混雑度{i+1}: {int(bins[i])+1}人〜 ({int(n[i])}件)")
        else:
            print(f"混雑度{i+1}: {int(bins[i])+1}人〜{int(bins[i+1])}人 ({int(n[i])}件)")
    
    # ヒストグラムの設定
    plt.figure(figsize=(12, 8))
    
    # ヒストグラムを描画
    n, bins_result, patches = plt.hist(daily_counts['count_1_hour'], bins=bins, edgecolor='black', alpha=0.7)
    
    # 各階級の度数を表示（位置を調整）
    for i in range(len(n)):
        if n[i] > 0:  # 度数が0より大きい場合のみ表示
            plt.text((bins[i] + bins[i+1])/2, n[i] + max(n)/30, f'{int(n[i])}', 
                     ha='center', va='bottom', fontweight='bold')
    
    # 混雑度レベルに色を付ける (10段階)
    colors = ['#fde725', '#b5de2b', '#6ece58', '#35b779', '#1f9e89', 
              '#26828e', '#31688e', '#3e4989', '#482878', '#440154']
    
    # すべてのパッチ（ヒストグラムの各バー）に対して色を設定する
    for i, patch in enumerate(patches):
        patch.set_facecolor(colors[min(i, len(colors)-1)])  # 範囲を超えないようにする
    
    # x軸のティックとラベルを削除
    plt.tick_params(axis='x', which='both', bottom=False, top=False, labelbottom=False)
    
    # 境界値を縦向きに表示
    for i in range(len(bins)):
        plt.axvline(x=bins[i], color='gray', linestyle='--', alpha=0.5)
        # 境界値テキストを縦向きに表示（最後の境界は表示しない）
        if i < len(bins) - 1:
            plt.text(bins[i], -max(n)/50, f'{int(bins[i])}', rotation=270, ha='center', va='top', fontsize=9)
    
    # グラフ設定
    plt.title(title)
    plt.ylabel('日数')
    plt.grid(axis='y', alpha=0.75)
    
    # 混雑度レベル10が含まれるよう、x軸の範囲を明示的に設定
    plt.xlim(0, bins[-1])
    
    # 凡例を追加（各レベルの値範囲も表示）
    for i in range(10):
        if i == 9:
            label = f'レベル {i+1} ({int(bins[i])}-)'
        else:
            label = f'レベル {i+1} ({int(bins[i])}-{int(bins[i+1])})'
        plt.plot([], [], color=colors[i], label=label)
    plt.legend(loc='upper right', title='混雑度', fontsize=9)
    
    plt.tight_layout()
    
    # 出力ファイル名
    output_file = os.path.join(output_dir, f"{place}_histogram.png")
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"ヒストグラム保存完了: {output_file}")

def main():
    """すべての場所のヒストグラムを生成する"""
    # 出力ディレクトリを確認/作成
    output_dir = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/hist"
    ensure_directory_exists(output_dir)
    
    # データディレクトリ
    data_dir = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/meidai"
    
    # 対象のCSVファイル
    places = [
        'honmachi2', 'honmachi3', 'honmachi4', 'jinnya', 
        'kokubunjidori', 'nakabashi', 'omotesando', 
        'yasukawadori', 'yottekan'
    ]
    
    # すべての場所についてヒストグラム作成
    for place in places:
        file_path = os.path.join(data_dir, f"{place}.csv")
        if os.path.exists(file_path):
            print(f"処理中: {place}")
            create_histogram(file_path, place, output_dir)
        else:
            print(f"ファイルが見つかりません: {file_path}")
    
    # すべての場所を含む総合ヒストグラムも作成
    #create_combined_histogram(data_dir, places, output_dir)

def create_combined_histogram(data_dir: str, places: list, output_dir: str):
    """すべての場所を含む総合的なヒストグラムを作成する"""
    all_counts = []
    min_date = None
    max_date = None
    
    for place in places:
        file_path = os.path.join(data_dir, f"{place}.csv")
        if os.path.exists(file_path):
            # 日ごとの歩行者数とデータ期間を取得
            daily_counts_dict, start_date, end_date = count_persons_by_day(file_path)
            
            if daily_counts_dict:
                # 開始日と終了日を更新
                if start_date and (min_date is None or start_date < min_date):
                    min_date = start_date
                if end_date and (max_date is None or end_date > max_date):
                    max_date = end_date
                
                # 辞書からDataFrameに変換して場所情報を追加
                place_df = pd.DataFrame([
                    {"datetime_jst": date, "count_1_hour": count, "place": place} 
                    for date, count in daily_counts_dict.items()
                ])
                all_counts.append(place_df)
    
    if not all_counts:
        print("データが見つかりませんでした")
        return
        
    # 全てのデータを結合
    combined_df = pd.concat(all_counts)
    
    # グラフ作成
    plt.figure(figsize=(14, 10))
    
    sns.histplot(data=combined_df, x='count_1_hour', hue='place', multiple='stack', bins=30, alpha=0.7)
    
    # タイトルにデータ期間を追加
    period_str = f" ({min_date} - {max_date})" if min_date and max_date else ""
    plt.title(f'全ての場所の混雑度分布{period_str}')
    
    # x軸ラベルを削除
    # plt.xlabel('歩行者数')
    plt.ylabel('日数')
    plt.grid(axis='y', alpha=0.75)
    plt.legend(title='場所')
    
    # 主要な値を縦向きに表示
    x_ticks = plt.gca().get_xticks()
    plt.xticks(x_ticks, [])  # 既存のx軸ラベルを削除
    
    for tick in x_ticks:
        if tick >= 0 and tick < combined_df['count_1_hour'].max() * 1.1:
            plt.text(tick, -combined_df['count_1_hour'].value_counts().max()/20, f'{int(tick)}', 
                     rotation=90, ha='right', va='top', fontsize=9)
    
    plt.tight_layout()
    output_file = os.path.join(output_dir, "all_places_histogram.png")
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"総合ヒストグラム保存完了: {output_file}")

# スクリプトがメインとして実行された場合のみ実行
if __name__ == "__main__":
    main()
    print("すべてのヒストグラム生成が完了しました")
