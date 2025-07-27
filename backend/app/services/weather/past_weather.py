import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import date, datetime, timedelta
from tqdm import tqdm
import time
import os
from datetime import datetime

# ====== ここで取得範囲を指定 ======
prec_no = '52'      # 地点番号 (例: 甲府)
block_no = '47617'  # ブロック番号 (例: 甲府)
output_csv = './backend/app/data/weather/past_weather.csv'

# 今日の日付を取得
# ▼▼ 修正 ▼▼ import文に合わせて、date.today()で今日の日付を取得します
today = date.today()
# 昨日の日付を計算
end_date = today - timedelta(days=1)
# 10日前の日付を計算 (開始日)
start_date = end_date - timedelta(days=10)
print(f"取得開始日: {start_date}")
print(f"取得終了日: {end_date}")
# =================================

# 欲しいカラム名（ページの表ヘッダに合わせる）- 日本語
japanese_target_cols = ['時', '降水量 (mm)', '気温 (℃)', '日照 時間 (h)', '積雪 (cm)', '降雪 (cm)', '天気']

def fetch_one_day(year, month, day, prec_no, block_no):
    """指定された1日分の気象データを気象庁サイトから取得する"""
    url = (f'https://www.data.jma.go.jp/stats/etrn/view/hourly_s1.php'
           f'?prec_no={prec_no}&block_no={block_no}&year={year}&month={month}&day={day}&view=p1')
    try:
        res = requests.get(url, timeout=15)
        res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"URLへのアクセス中にエラーが発生しました: {url} - {e}")
        return []
        
    res.encoding = res.apparent_encoding
    soup = BeautifulSoup(res.text, 'html.parser')
    table = soup.find('table', {'id': 'tablefix1'})
    if not table:
        print(f"テーブルが見つかりません: {year}-{month:02d}-{day:02d}")
        return []

    header_rows = table.find_all('tr')[:2]
    header1 = [th.get_text(strip=True).replace('\n', '') for th in header_rows[0].find_all('th')]
    header2 = [th.get_text(strip=True).replace('\n', '') for th in header_rows[1].find_all('th')]
    columns = []
    i2 = 0
    for th in header_rows[0].find_all('th'):
        colspan = int(th.get('colspan', 1))
        rowspan = int(th.get('rowspan', 1))
        if rowspan == 2:
            columns.append(th.get_text(strip=True).replace('\n', ''))
        else:
            for _ in range(colspan):
                columns.append(header2[i2])
                i2 += 1
    col_indices = []
    for col in japanese_target_cols:
        found_index = None
        for i, c in enumerate(columns):
            if col.replace(' ', '') in c.replace('\n', '').replace(' ', ''):
                found_index = i
                break
        col_indices.append(found_index)
    
    all_data = []
    data_rows = table.find_all('tr')[2:]
    for tr in data_rows:
        if tr.find('th'):
            continue
        tds = tr.find_all('td')
        if not tds:
            continue
        row = []
        for idx, col_idx in enumerate(col_indices):
            if col_idx is not None and col_idx < len(tds):
                if japanese_target_cols[idx] == '天気':
                    img = tds[col_idx].find('img')
                    row.append(img['alt'] if img and 'alt' in img.attrs else '')
                else:
                    row.append(tds[col_idx].get_text(strip=True))
            else:
                row.append('')
        row = [f'{year}-{month:02d}-{day:02d}'] + row
        all_data.append(row)

    return all_data

# --- メイン処理 ---
# 1. 既存CSV読み込み
existing_df = pd.DataFrame()
if os.path.exists(output_csv):
    try:
        existing_df = pd.read_csv(output_csv, encoding='utf-8-sig', dtype={'時': str})
        print(f'既存のCSV "{output_csv}" を読み込みました。現在の行数: {len(existing_df)}')
    except Exception as e:
        print(f'既存のCSV "{output_csv}" の読み込み中にエラーが発生しました: {e}')
        existing_df = pd.DataFrame()

# ▼▼▼【修正箇所】ダウンロード対象日の決定ロジックを変更 ▼▼▼
# 既存の日付チェックをやめ、指定された範囲を常にダウンロード対象とする
print(f"指定された期間 ({start_date} から {end_date}) のデータを取得・更新します。")
dates_to_fetch = []
dt = start_date
dt_end = end_date
while dt <= dt_end:
    dates_to_fetch.append((dt.year, dt.month, dt.day))
    dt += timedelta(days=1)
# ▲▲▲ 修正ここまで ▲▲▲

# 3. データ取得
# 3. データ取得
new_data_rows = []
if dates_to_fetch:
    print(f"{len(dates_to_fetch)}日分のデータを取得します...")
    for y, m, d in tqdm(dates_to_fetch):
        try:
            day_data = fetch_one_day(y, m, d, prec_no, block_no)
            print(f"{y}-{m}-{d} 取得件数: {len(day_data)}")
            if day_data:
                new_data_rows.extend(day_data)
            time.sleep(1)
        except Exception as e:
            print(f'{y}-{m:02d}-{d:02d} のデータ取得中にエラーが発生しました: {e}')
    print(f"全取得件数: {len(new_data_rows)}")
else:
    print("指定された期間に、取得対象のデータはありませんでした。")


# 4. データ結合と事前重複排除
if new_data_rows:
    new_data_df = pd.DataFrame(new_data_rows, columns=['日付'] + japanese_target_cols)
    combined_df = pd.concat([existing_df, new_data_df], ignore_index=True)
    print(f"{len(new_data_rows)}行の新しいデータを取得しました。")
else:
    combined_df = existing_df.copy()

if not combined_df.empty and '日付' in combined_df.columns and '時' in combined_df.columns:
    # '時'列の表記（'1時'と'1'）を統一
    combined_df['時'] = combined_df['時'].astype(str).str.replace('時', '').str.strip()
    # 日付と時刻をキーにして重複を削除。keep='last'で常に新しいデータを優先する
    combined_df.drop_duplicates(subset=['日付', '時'], keep='last', inplace=True)
    print(f"重複排除後の行数: {len(combined_df)}")

if not combined_df.empty and '日付' in combined_df.columns and '時' in combined_df.columns:
    # '時'列の表記（'1時'と'1'）を統一
    combined_df['時'] = combined_df['時'].astype(str).str.replace('時', '').str.strip()
    # 24時を0時に変換
    combined_df['時'] = combined_df['時'].replace({'24': '0'})
    # 日付と時刻をキーにして重複を削除。keep='last'で常に新しいデータを優先する
    combined_df.drop_duplicates(subset=['日付', '時'], keep='last', inplace=True)
    print(f"重複排除後の行数: {len(combined_df)}")


# 5. 結合したDataFrameの整形、ソート、保存
if not combined_df.empty:
    # --- 処理の安定化：主要な列を文字列に統一 ---
    combined_df['日付'] = combined_df['日付'].astype(str)
    combined_df['時'] = combined_df['時'].astype(str)

    # --- 一時的な作業列を作成 ---
    hour_numeric = pd.to_numeric(combined_df['時'], errors='coerce')
    date_dt = pd.to_datetime(combined_df['日付'], errors='coerce')

    # --- 24時の処理 ---
    is_24h = (hour_numeric == 24)
    valid_dates_for_24h = is_24h & date_dt.notna()
    date_dt.loc[valid_dates_for_24h] = date_dt.loc[valid_dates_for_24h] + pd.to_timedelta(1, unit='d')
    hour_numeric.loc[is_24h] = 0

    # --- 不正な行の除外 ---
    combined_df['temp_date'] = date_dt
    combined_df['temp_hour'] = hour_numeric
    valid_df = combined_df.dropna(subset=['temp_date', 'temp_hour']).copy()

    # --- 有効なデータのみをソート ---
    valid_df.sort_values(by=['temp_date', 'temp_hour'], inplace=True, ascending=True)

    # --- 表示用列の再構築 ---
    valid_df['日付'] = valid_df['temp_date'].dt.strftime('%Y-%m-%d')
    valid_df['時'] = valid_df['temp_hour'].astype(int).astype(str) + '時'
    
    # --- 最終的なDataFrameの作成 ---
    final_df = valid_df[['日付'] + japanese_target_cols].copy()
    
    final_df.to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f'データを更新し、"{output_csv}" を日付時間順・日本語列名で保存しました。総行数: {len(final_df)}')
else:
    print('処理対象のデータがありませんでした。CSVファイルは変更されませんでした。')
