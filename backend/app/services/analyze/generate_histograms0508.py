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

# 静的なCONGESTION_THRESHOLDSは保持（フォールバック用）
CONGESTION_THRESHOLDS = {
    # 場所ごとの(min_threshold, max_threshold)を定義
    'honmachi2': (65, 850),
    'honmachi3': (35, 750),
    'honmachi4': (50, 2000),
    'jinnya': (50, 1000),
    'kokubunjidori': (40, 450),
    'nakabashi': (40, 650),
    'omotesando': (25, 700),
    'yasukawadori': (400, 2900),
    'yottekan': (10, 300),
    # デフォルト値
    'default': (10, 500)  # 00から500に修正
}


def ensure_directory_exists(directory_path: str):
    """指定されたディレクトリが存在しない場合は作成する"""
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)


def count_persons_by_hour(csv_file_path: str) -> Tuple[pd.DataFrame, str, str]:
    """
    CSVファイルから1時間ごとの人数データを取得する
    23時から6時までのデータを除外する
    
    Returns:
        Tuple[pd.DataFrame, str, str]: 1時間ごとのデータを含むDataFrame、開始日、終了日
    """
    try:
        # CSVファイルを読み込む
        df = pd.read_csv(csv_file_path)
        
        # 必要なカラムがあることを確認
        required_columns = ['name', 'count_1_hour', 'time_jst']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            print(f"Warning: Missing columns in {csv_file_path}: {missing_columns}")
            return pd.DataFrame(), "", ""
        
        # 日付カラムを探す
        date_column = None
        for col in ['date_jst', 'datetime_jst']:
            if col in df.columns:
                date_column = col
                break
                
        if not date_column:
            print(f"Warning: No date column found in {csv_file_path}")
            return pd.DataFrame(), "", ""
        
        # 日付カラムをdatetimeに変換
        df[date_column] = pd.to_datetime(df[date_column])
        
        # 'person'のデータのみフィルタリング
        person_df = df[df['name'] == 'person']
        
        if person_df.empty:
            return pd.DataFrame(), "", ""
            
        # 時間帯を抽出して、7時から22時までのデータのみに絞る
        # time_jstカラムは既に存在するので、それを直接使用する
        filtered_df = person_df[(person_df['time_jst'] >= 7) & (person_df['time_jst'] <= 22)]
        
        if filtered_df.empty:
            print(f"警告: {csv_file_path}で時間帯フィルタリング（7時〜22時）後にデータがありません")
            return pd.DataFrame(), "", ""
            
        # フィルタリング後のデータ期間を取得
        start_date = filtered_df[date_column].min().strftime('%Y/%m/%d %H:%M')
        end_date = filtered_df[date_column].max().strftime('%Y/%m/%d %H:%M')
        
        # 必要なカラムのみ抽出
        result_df = filtered_df[[date_column, 'count_1_hour']].copy()
        
        print(f"{csv_file_path}から取得したデータ: 全{len(person_df)}件中、7時〜22時のデータ{len(filtered_df)}件")
        
        return result_df, start_date, end_date
        
    except Exception as e:
        print(f"Error processing {csv_file_path}: {e}")
        return pd.DataFrame(), "", ""


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
    
    # エラー処理：average値が最小閾値より小さい場合や最大閾値がaverage値より小さい場合
    if middle_threshold <= min_threshold:
        # 平均値が最小閾値以下の場合、単純に等間隔で設定
        print(f"警告: {place}の平均値({middle_threshold:.2f})が最小閾値({min_threshold})以下です。等間隔で境界値を設定します。")
        step = (max_threshold - min_threshold) / 8
        bins = [0, min_threshold]
        for i in range(1, 8):
            bins.append(min_threshold + step * i)
        bins.append(max_threshold)
        bins.append(max_threshold * 10)  # 十分大きな値
    elif max_threshold <= middle_threshold:
        # 最大閾値が平均値以下の場合、単純に等間隔で設定
        print(f"警告: {place}の最大閾値({max_threshold})が平均値({middle_threshold:.2f})以下です。等間隔で境界値を設定します。")
        step = middle_threshold / 5  # 平均値を5等分
        bins = [0]
        for i in range(1, 10):
            bins.append(i * step)
        bins.append(middle_threshold * 2)  # 十分大きな値
    else:
        # 通常のケース
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
        
        # 最後に最大値をはるかに超える値を追加
        max_val = max(counts)
        bins.append(max(max_val * 1.5, max_threshold * 10))
    
    # 境界値の単調増加を確認し、必要に応じて修正
    for i in range(1, len(bins)):
        if bins[i] <= bins[i-1]:
            # 単調増加でない場合は、前の値より少しだけ大きくする
            bins[i] = bins[i-1] * 1.01
    
    title = f"{place} - 混雑度分布 (混雑度1,2境界値: {min_threshold}, 混雑度9,10境界値: {max_threshold})"
    return bins, title


def create_histogram(file_path: str, place: str, output_dir: str):
    """指定した場所のデータを使って混雑度のヒストグラムを作成する"""
    # 1時間ごとの歩行者数を取得（7時〜22時のデータのみ）
    hourly_data, start_date, end_date = count_persons_by_hour(file_path)
    
    if hourly_data.empty:
        print(f"データが取得できませんでした: {file_path}")
        return
    
    # タイトルにデータ期間と時間帯を追加
    title = f"{place} - 1時間ごとの混雑度分布 (7時〜22時, {start_date} - {end_date})"
    
    # CONGESTION_THRESHOLDSからレベル1-2と9-10の境界値を取得（凡例表示用）
    min_threshold, max_threshold = CONGESTION_THRESHOLDS.get(place, CONGESTION_THRESHOLDS['default'])
    
    # データの最小値と最大値
    min_count = hourly_data['count_1_hour'].min()
    max_count = hourly_data['count_1_hour'].max()
    
    # ------ 改良部分: ヒストグラム表示のアプローチを変更 ------
    
    plt.figure(figsize=(12, 8))
    
    # オプション1: 対数スケールでのヒストグラム
    # この場合は均等な階級幅でもデータを見やすく分布表示できる
    # log=Trueの代わりに、xscaleを使う方法
    # ax = plt.gca()
    # ax.set_xscale('log')
    
    # オプション2: 均等な階級数を使用（データの分布に基づいて自動調整）
    n_bins = min(30, len(hourly_data['count_1_hour'].unique()))  # ユニークな値の数によって調整
    
    # ヒストグラムを描画（均等な階級幅）
    counts, bin_edges, patches = plt.hist(hourly_data['count_1_hour'], bins=n_bins, 
                                        edgecolor='black', alpha=0.7)
    
    # 度数の重要性を強調するために各バーに値を表示
    for i in range(len(counts)):
        if counts[i] > 0:  # 度数が0より大きい場合のみ表示
            bin_center = (bin_edges[i] + bin_edges[i+1]) / 2
            plt.text(bin_center, counts[i] + max(counts)/30, f'{int(counts[i])}', 
                    ha='center', va='bottom', fontweight='bold')
    
    # 混雑度レベルの色分け
    colors = ['#fde725', '#b5de2b', '#6ece58', '#35b779', '#1f9e89', 
              '#26828e', '#31688e', '#3e4989', '#482878', '#440154']
    
    # 混雑度レベルに基づいて色を設定
    congestion_bins = calculate_congestion_bins(place, hourly_data)[0]
    
    for i, patch in enumerate(patches):
        left_edge = bin_edges[i]
        
        # 値がどの混雑度レベルに対応するかを決定
        level = 0
        for j in range(len(congestion_bins)-1):
            if left_edge >= congestion_bins[j] and left_edge < congestion_bins[j+1]:
                level = j
                break
        
        # 対応する混雑度レベルの色を設定
        color_idx = min(level, len(colors)-1)
        patch.set_facecolor(colors[color_idx])
    
    # 主要な混雑度レベルの境界線を描画
    for i, threshold in enumerate(congestion_bins):
        if i > 0 and i < len(congestion_bins) - 1:  # 最初と最後の境界は除外
            plt.axvline(x=threshold, color='gray', linestyle='--', alpha=0.5)
            plt.text(threshold, -max(counts)/40, f'{int(threshold)}', 
                    rotation=90, ha='right', va='top', fontsize=9)
    
    # グラフ設定
    plt.title(title)
    plt.xlabel('歩行者数')
    plt.ylabel('時間数')
    plt.grid(axis='y', alpha=0.75)
    
    # 凡例を追加
    legend_items = []
    for i in range(10):
        start_val = congestion_bins[i] if i < len(congestion_bins) else 0
        if i == 9:
            end_val = ''
            label = f'レベル {i+1} ({int(start_val)}-)'
        else:
            end_val = congestion_bins[i+1] if i+1 < len(congestion_bins) else 0
            label = f'レベル {i+1} ({int(start_val)}-{int(end_val)})'
        
        legend_items.append(plt.Rectangle((0,0), 1, 1, color=colors[i], label=label))
    
    plt.legend(handles=legend_items, loc='upper right', title='混雑度レベル', fontsize=9)
    
    plt.tight_layout()
    
    # 出力ファイル名
    output_file = os.path.join(output_dir, f"{place}_histogram.png")
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"ヒストグラム保存完了: {output_file}")


def create_combined_histogram(data_dir: str, places: list, output_dir: str):
    """すべての場所を含む総合的なヒストグラムを作成する"""
    all_counts = []
    min_date = None
    max_date = None
    
    for place in places:
        file_path = os.path.join(data_dir, f"{place}.csv")
        if os.path.exists(file_path):
            # 1時間ごとの歩行者数とデータ期間を取得
            hourly_data, start_date, end_date = count_persons_by_hour(file_path)
            
            if not hourly_data.empty:
                # 開始日と終了日を更新
                if start_date and (min_date is None or start_date < min_date):
                    min_date = start_date
                if end_date and (max_date is None or end_date > max_date):
                    max_date = end_date
                
                # 場所情報を追加
                hourly_data['place'] = place
                all_counts.append(hourly_data)
    
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


def main():
    """すべての場所のヒストグラムを生成する"""
    # 出力ディレクトリを確認/作成
    output_dir = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/weather_time/hist"
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
    create_combined_histogram(data_dir, places, output_dir)


# スクリプトがメインとして実行された場合のみ実行
if __name__ == "__main__":
    main()
    print("すべてのヒストグラム生成が完了しました")
