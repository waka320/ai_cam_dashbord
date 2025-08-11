import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta, date 
import matplotlib as mpl
from matplotlib.patches import Patch
import argparse
import numpy as np

# 日本語フォントの設定
plt.rcParams['font.family'] = 'Hiragino Sans GB'
mpl.rcParams['axes.unicode_minus'] = False

# コマンドライン引数の設定
parser = argparse.ArgumentParser(description='イベント期間の歩行者数分析')
parser.add_argument('--year', type=int, default=2025, help='分析する年 (例: 2025)')
args = parser.parse_args()

# CSVファイルを読み込む
df = pd.read_csv('/Users/WakaY/Desktop/new_dashbord/backend/app/data/meidai/yasukawadori.csv')

# datetime_jstをdatetime型に変換
df['datetime_jst'] = pd.to_datetime(df['datetime_jst'])

# 時間単位のデータを確認
print(f"最初のデータ時間: {df['datetime_jst'].min()}")
print(f"最後のデータ時間: {df['datetime_jst'].max()}")

# データの整合性チェック - 各日の時間数をカウント
hours_per_day = df.groupby(df['datetime_jst'].dt.date).size()
incomplete_days = hours_per_day[hours_per_day < 24]
if not incomplete_days.empty:
    print("\n注意: 以下の日は24時間分のデータがありません:")
    for date, hours in incomplete_days.items():
        print(f"{date}: {hours}時間分のデータ")

# イベントのリストと日付を年別に定義
events_by_year = {
    2022: [
        ("二十四日市", ["2022-01-24"]),
        ("春の江名子川ライトアップ", ["2022-03-20", "2022-04-10"]),
        ("春の高山祭（山王祭）", ["2022-04-14", "2022-04-15"]),
        ("夏の夜市", ["2022-07-15", "2022-07-16"]),
        ("納涼七夕まつり", ["2022-08-07"]),
        ("飛騨高山・酒蔵のん兵衛まつり", [
            "2022-06-05", "2022-06-06", "2022-06-07", "2022-06-08", "2022-06-09",
            "2022-06-10", "2022-06-11", "2022-06-12", "2022-06-13", "2022-06-14",
            "2022-06-15", "2022-06-16", "2022-06-17", "2022-06-18", "2022-06-19",
            "2022-06-20", "2022-06-21", "2022-06-22", "2022-06-23", "2022-06-24",
            "2022-06-25", "2022-06-26", "2022-06-27", "2022-06-28", "2022-06-29",
            "2022-06-30"
        ]),
        ("秋の高山祭（八幡祭）", ["2022-10-09", "2022-10-10"]),
        ("飛騨の里紅葉ライトアップ", [
            "2022-10-12", "2022-10-13", "2022-10-19", "2022-10-20", "2022-10-26",
            "2022-10-27", "2022-11-02", "2022-11-03", "2022-11-09", "2022-11-10"
        ]),
        ("秋の紅葉ライトアップ", ["2022-11-01", "2022-11-30"]),
        ("クリスマスライトアップ", [
            "2022-12-21", "2022-12-22", "2022-12-23", "2022-12-24", "2022-12-25"
        ])
    ],
    2023: [
        ("二十四日市", ["2023-01-24"]),
        ("春の江名子川ライトアップ", ["2023-03-20", "2023-04-10"]),
        ("春の高山祭（山王祭）", ["2023-04-14", "2023-04-15"]),
        ("夏の夜市", ["2023-07-15", "2023-07-16"]),
        ("納涼七夕まつり", ["2023-08-07"]),
        ("飛騨高山・酒蔵のん兵衛まつり", ["2023-06-05", "2023-06-30"]),
        ("秋の高山祭（八幡祭）", ["2023-10-09", "2023-10-10"]),
        ("秋の紅葉ライトアップ", ["2023-11-01", "2023-11-30"])
    ],
    2024: [
        # ("二十四日市", ["2024-01-24"]),
        # ("春の江名子川ライトアップ", ["2024-04-01", "2024-05-06"]),
        ("春の高山祭（山王祭）", ["2024-04-14", "2024-04-15"]),
        ("ひだ国分寺 八日市", [
            "2024-05-08", "2024-06-08", "2024-07-08", "2024-08-08", "2024-09-08",
            "2024-10-08"
        ]),
        ("飛騨クラフトフェア", ["2024-06-01", "2024-06-02"]),
        ("桜山八幡宮 縁日イベント", ["2024-07-27"]),
        ("桜山風鈴まつり", [
            "2024-07-20", "2024-07-27", "2024-08-03", "2024-08-10", "2024-08-17",
            "2024-08-24"
        ]),
        ("陣屋前夜市", ["2024-08-05", "2024-08-06"]),
        ("飛騨高山手筒花火", ["2024-08-09"]),
        ("市民盆踊り大会", ["2024-08-25"]),
        ("秋の高山祭（八幡祭）", ["2024-10-09", "2024-10-10"]),
        ("農業まつり", ["2024-10-20"]),
        ("朝市", [
            date.strftime("%Y-%m-%d") for date in pd.date_range("2024-04-01", "2024-11-30") if date.weekday() in [5, 6]
        ])
    ],
    2025: [
        # ("二十四日市", ["2025-01-24"]),
        ("第21回雫宮祭", ["2025-03-16"]),
        ("春の中橋ライトアップ", ["2025-04-01", "2025-05-25"]),
        ("春の江名子川ライトアップ", ["2025-04-01", "2025-05-25"]),
        ("春の高山祭（山王祭）", ["2025-04-14", "2025-04-15"]),
        ("飛騨高山端午の節句", ["2025-05-01", "2025-06-05"]),
        ("夏の飛騨高山ライトアップ", ["2025-07-01", "2025-08-31"]),
        ("秋の中橋ライトアップ", ["2025-10-01", "2025-11-30"]),
        ("秋の江名子川ライトアップ", ["2025-10-01", "2025-11-30"]),
        ("冬の飛騨高山ライトアップ", ["2025-12-01", "2026-03-15"]),
        ("年の瀬市", ["2025-12-27", "2025-12-31"])
    ]
}

# 指定された年のイベントがない場合はメッセージを表示
if args.year not in events_by_year:
    print(f"{args.year}年のイベントデータはありません。利用可能な年: {', '.join(map(str, events_by_year.keys()))}")
    exit()

# 指定された年のイベントを取得
events = events_by_year[args.year]


# イベントごとに歩行者数を分析
for event_name, event_dates in events:
    event_dates = [datetime.strptime(date, "%Y-%m-%d") for date in event_dates]
    
    # イベント期間に応じて前後の日数を調整
    event_duration = (max(event_dates) - min(event_dates)).days + 1
    
    start_date = min(event_dates) - timedelta(days=3)
    end_date = max(event_dates) + timedelta(days=4)
    
    print(f"\n{event_name} 分析期間: {start_date.date()} から {end_date.date()}")
    
    # イベント前後の期間のデータを抽出
    event_data = df[(df['datetime_jst'] >= start_date) & (df['datetime_jst'] <= end_date) & (df['name'] == 'person')]
    
    # データがない場合はスキップ
    if event_data.empty:
        print(f"{event_name}のデータがありません。")
        continue
    
    # 日ごとのデータ件数を確認
    data_counts = event_data.groupby(event_data['datetime_jst'].dt.date).size()
    
    # 日ごとの合計歩行者数を計算
    daily_counts = event_data.groupby(event_data['datetime_jst'].dt.date)['count_1_hour'].sum()

    # 最後の日付のデータを切り落とす
    if len(daily_counts) > 0:
        last_date = daily_counts.index[-1]
        daily_counts = daily_counts[:-1]  # 最後の日を除外
        print(f"注意: 最後の日付 {last_date} のデータは不完全の可能性があるため除外しました")

    # データの整合性チェック - 分析期間内の各日のデータ件数
    for day in pd.date_range(start_date, end_date - timedelta(days=1)).date:  # 最後の日を除外
        if day not in data_counts.index:
            print(f"警告: {day}のデータがありません")
        elif data_counts[day] < 12:  # 少なくとも12時間分のデータがあるべき
            print(f"警告: {day}のデータが不完全です ({data_counts[day]}時間分)")
    
    # 欠損値のある日を除外または補完
    print(f"\n{event_name}の歩行者数:")
    
    # イベント日と非イベント日で比較分析
    event_dates_as_date = [event_date.date() for event_date in event_dates]
    non_event_days = [date for date in daily_counts.index if date not in event_dates_as_date]
    event_days = [date for date in daily_counts.index if date in event_dates_as_date]
    
    if event_days:
        event_avg = daily_counts[event_days].mean()
        print(f"イベント期間の平均歩行者数: {event_avg:.1f}人/日")
        
        if non_event_days:
            non_event_avg = daily_counts[non_event_days].mean()
            change_percent = ((event_avg / non_event_avg) - 1) * 100
            print(f"非イベント期間の平均歩行者数: {non_event_avg:.1f}人/日")
            print(f"増減率: {change_percent:.1f}%")
    
    print("\n日別詳細:")
    for date, count in daily_counts.items():
        event_marker = "【イベント日】" if date in event_dates_as_date else ""
        data_hours = data_counts.get(date, 0)
        print(f"{date}: {count:.0f}人 ({data_hours}時間分のデータ) {event_marker}")
    
    # 異常値の検出（オプション）
    # 中央値からの乖離が大きいデータを検出
    median = daily_counts.median()
    mad = np.median(np.abs(daily_counts - median))
    outliers = daily_counts[np.abs(daily_counts - median) > 3 * mad]
    if not outliers.empty:
        print("\n注意: 以下の日は通常と大きく異なる歩行者数を記録しています:")
        for date, count in outliers.items():
            event_marker = "【イベント日】" if date in event_dates_as_date else ""
            print(f"{date}: {count:.0f}人 {event_marker}")
    
    # ヒストグラム風の棒グラフを作成（棒の間隔なし）
    plt.figure(figsize=(14, 7))
    
    # 通常の棒グラフから間隔を詰めたヒストグラム風に変更
    ax = plt.subplot(111)
    bars = ax.bar(range(len(daily_counts)), daily_counts.values, width=1.0, color='lightblue', edgecolor='gray', linewidth=0.5)

    # 日付を設定
    plt.xticks(range(len(daily_counts)), [date.strftime('%m/%d') for date in daily_counts.index], rotation=45)

    # イベント期間をタイトルに追加
    event_period = f"{min(event_dates).strftime('%Y/%m/%d')}～{max(event_dates).strftime('%Y/%m/%d')}" if len(event_dates) > 1 else event_dates[0].strftime('%Y/%m/%d')

    # 増減率も表示
    if len(event_days) > 0 and len(non_event_days) > 0:
        plt.title(f"{args.year}年 {event_name}の歩行者数（イベント期間: {event_period}, 増減率: {change_percent:.1f}%）")
    else:
        plt.title(f"{args.year}年 {event_name}の歩行者数（イベント期間: {event_period}）")

    plt.xlabel("日付")
    plt.ylabel("歩行者数")

    # グラフの下部に余白を追加して日付が切れないようにする
    plt.gcf().subplots_adjust(bottom=0.2)

    # イベント日をハイライト
    for i, date in enumerate(daily_counts.index):
        if date in event_dates_as_date:
            bars[i].set_color('red')
            # イベント日の上部にラベルを追加
            count = daily_counts.iloc[i]
            ax.text(i, count + (daily_counts.max() * 0.03), "イベント日", ha='center', color='red', fontweight='bold', fontsize=9)

    # 凡例を追加
    legend_elements = [
        Patch(facecolor='lightblue', label='通常日'),
        Patch(facecolor='red', label='イベント日')
    ]
    ax.legend(handles=legend_elements, loc='upper right')

    # # データの不完全な日を薄いグレーでマーク
    # for i, date in enumerate(daily_counts.index):
    #     if date in incomplete_days:
    #         bars[i].set_alpha(0.5)
    #         bars[i].set_hatch('///')

    # イベント期間が複数日の場合、背景に薄い色を付ける
    if len(event_dates) > 1:
        event_indices = [i for i, date in enumerate(daily_counts.index) if date in event_dates_as_date]
        if event_indices:
            min_idx = min(event_indices)
            max_idx = max(event_indices)
            ax.axvspan(min_idx - 0.5, max_idx + 0.5, alpha=0.1, color='red')

    # グリッドラインを追加して見やすくする
    ax.grid(axis='y', linestyle='--', alpha=0.7)

    # 平均値の水平線を追加
    if event_days:
        ax.axhline(y=event_avg, color='red', linestyle='--', alpha=0.7, label=f'イベント日平均: {event_avg:.1f}人')
    if non_event_days:
        ax.axhline(y=non_event_avg, color='blue', linestyle='--', alpha=0.7, label=f'非イベント日平均: {non_event_avg:.1f}人')

    plt.tight_layout()

    # グラフをファイルに保存（オプション）
    # plt.savefig(f"{args.year}_{event_name.replace(' ', '_')}_histogram.png", dpi=300)

    plt.show()
