import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Tuple
import matplotlib

# 日本語フォントのサポート設定
matplotlib.rcParams['font.family'] = 'Hiragino Sans GB'  # macOSの場合
# WindowsやLinuxの場合は以下のいずれかを試す
# matplotlib.rcParams['font.family'] = 'IPAGothic'  
# matplotlib.rcParams['font.family'] = 'MS Gothic'
# matplotlib.rcParams['font.sans-serif'] = ['IPAGothic', 'MS Gothic', 'Hiragino Sans GB']
matplotlib.rcParams['font.size'] = 12
matplotlib.rcParams['axes.unicode_minus'] = False  # マイナス記号の文字化け対策

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

def count_persons_by_day(csv_file_path: str) -> Dict:
    """
    CSVファイルから日ごとの人数を集計する
    同じ日の全方向(toEast, toWestなど)の人数を合計する
    """
    try:
        # CSVファイルを読み込む
        df = pd.read_csv(csv_file_path)
        
        # 必要なカラムがあることを確認
        required_columns = ['name', 'count_1_hour']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            print(f"Warning: Missing columns in {csv_file_path}: {missing_columns}")
            return {}
        
        # 日付カラムを探す
        date_column = None
        for col in ['date_jst', 'datetime_jst']:
            if col in df.columns:
                date_column = col
                break
                
        if not date_column:
            print(f"Warning: No date column found in {csv_file_path}")
            return {}
        
        # 日付カラムをdatetimeに変換
        df[date_column] = pd.to_datetime(df[date_column])
        
        # 日付部分のみ抽出
        df['date_only'] = df[date_column].dt.date
        
        # 'person'の人数を日ごとにグループ化して合計
        person_df = df[df['name'] == 'person']
        daily_count = person_df.groupby('date_only')['count_1_hour'].sum()
        
        # 辞書形式に変換して返す
        return {date: count for date, count in daily_count.items()}
        
    except Exception as e:
        print(f"Error processing {csv_file_path}: {e}")
        return {}

def calculate_congestion_bins(place: str) -> Tuple[list, str]:
    """場所に応じた混雑度の境界値を計算する"""
    min_threshold, max_threshold = CONGESTION_THRESHOLDS.get(place, CONGESTION_THRESHOLDS['default'])
    step = (max_threshold - min_threshold) / 8
    
    # 境界値を計算
    bins = [0, min_threshold]
    for i in range(1, 8):
        bins.append(min_threshold + step * i)
    bins.append(max_threshold)
    
    # 最大値を追加 (CSVデータの最大値よりも大きい値を設定)
    # float('inf')だとヒストグラムが正しく表示されないので、具体的な大きな値を使用
    bins.append(max_threshold * 10)  # 十分大きな値を使用
    
    title = f"{place} - 混雑度分布 (境界値: {min_threshold}～{max_threshold})"
    return bins, title

def create_histogram(file_path: str, place: str, output_dir: str):
    """指定した場所のデータを使って混雑度のヒストグラムを作成する"""
    # 日ごとの歩行者数を取得
    daily_counts_dict = count_persons_by_day(file_path)
    
    if not daily_counts_dict:
        print(f"データが取得できませんでした: {file_path}")
        return
    
    # 辞書からDataFrameに変換
    daily_counts = pd.DataFrame([
        {"datetime_jst": date, "count_1_hour": count} 
        for date, count in daily_counts_dict.items()
    ])
    
    bins, title = calculate_congestion_bins(place)
    
    # 最大値を確認してbinsを調整
    max_count = daily_counts['count_1_hour'].max() if not daily_counts.empty else 0
    print(f"{place}の最大歩行者数: {max_count}")
    
    # 最大値が最後のbin（混雑度10の下限）より大きい場合は、最後のbinを調整
    if max_count > bins[-2]:
        # 最後のbinを最大値より少し大きい値に設定
        bins[-1] = max_count * 1.1  # 最大値より10%大きい値
    
    # ヒストグラムの設定
    plt.figure(figsize=(12, 8))
    
    # ヒストグラムを描画
    n, bins_result, patches = plt.hist(daily_counts['count_1_hour'], bins=bins, edgecolor='black', alpha=0.7)
    
    # 各階級の度数を表示
    for i in range(len(n)):
        plt.text((bins[i] + bins[i+1])/2, n[i] + max(n)/50, f'{int(n[i])}', 
                 ha='center', va='bottom', fontweight='bold')
    
    # 混雑度レベルに色を付ける (10段階)
    colors = ['#191970', '#0047AB', '#4A69BD', '#6C8EBF', '#B0C4DE', 
              '#FFB6C1', '#FF7F7F', '#CD5C5C', '#B22222', '#800000']
    
    # すべてのパッチ（ヒストグラムの各バー）に対して色を設定する
    for i, patch in enumerate(patches):
        patch.set_facecolor(colors[min(i, len(colors)-1)])  # 範囲を超えないようにする
    
    # x軸ラベルを整形し、10段階目までのラベルも表示
    tick_positions = [(bins[i] + bins[i+1]) / 2 for i in range(len(bins)-1)]
    plt.xticks(tick_positions, [f"{int(bins[i])}" for i in range(len(bins)-1)], rotation=45, ha='right')
    
    # グラフ設定
    plt.title(title)
    plt.xlabel('歩行者数')
    plt.ylabel('日数')
    plt.grid(axis='y', alpha=0.75)
    
    # レベル番号を表示 (10段階すべてを表示)
    for i in range(10):
        mid_x = (bins[i] + bins[i+1]) / 2
        plt.text(mid_x, -max(n)/20, f'{i+1}', ha='center', va='top', fontweight='bold')
    
    # 混雑度レベルの境界線を追加
    for i in range(1, len(bins)):
        plt.axvline(x=bins[i], color='gray', linestyle='--', alpha=0.5)
    
    # 混雑度レベル10が含まれるよう、x軸の範囲を明示的に設定
    plt.xlim(0, bins[-1])
    
    # 凡例を追加
    for i in range(10):
        plt.plot([], [], color=colors[i], label=f'レベル {i+1}')
    plt.legend(loc='upper right', title='混雑度')
    
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
    # create_combined_histogram(data_dir, places, output_dir)

def create_combined_histogram(data_dir: str, places: list, output_dir: str):
    """すべての場所を含む総合的なヒストグラムを作成する"""
    all_counts = []
    
    for place in places:
        file_path = os.path.join(data_dir, f"{place}.csv")
        if os.path.exists(file_path):
            # 日ごとの歩行者数を取得（新しい関数を使用）
            daily_counts_dict = count_persons_by_day(file_path)
            
            if daily_counts_dict:
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
    
    plt.title('全ての場所の混雑度分布')
    plt.xlabel('歩行者数')
    plt.ylabel('日数')
    plt.grid(axis='y', alpha=0.75)
    plt.legend(title='場所')
    
    plt.tight_layout()
    output_file = os.path.join(output_dir, "all_places_histogram.png")
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"総合ヒストグラム保存完了: {output_file}")

# スクリプトがメインとして実行された場合のみ実行
if __name__ == "__main__":
    main()
    print("すべてのヒストグラム生成が完了しました")
