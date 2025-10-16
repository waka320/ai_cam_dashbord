#!/usr/bin/env python3
"""
イベント効果分析機能のテストスクリプト
"""
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.analyze.get_event_effect import get_event_effect_data
import json

def test_event_effect():
    """イベント効果分析のテスト"""
    
    # テストパラメータ
    csv_file_path = "app/data/meidai/honmachi4.csv"
    event_year = 2025
    event_month = 4
    event_day = 14  # 高山祭の日
    
    print("=" * 80)
    print("イベント効果分析テスト")
    print("=" * 80)
    print(f"CSVファイル: {csv_file_path}")
    print(f"イベント日: {event_year}/{event_month}/{event_day}")
    print()
    
    # CSVファイルの存在確認
    if not os.path.exists(csv_file_path):
        print(f"❌ エラー: CSVファイルが見つかりません: {csv_file_path}")
        return
    
    print("✓ CSVファイルが存在します")
    print()
    
    # データ取得
    print("データ取得中...")
    print("-" * 80)
    result = get_event_effect_data(csv_file_path, event_year, event_month, event_day)
    print("-" * 80)
    print()
    
    # 結果の確認
    if 'error' in result and result['error']:
        print(f"❌ エラーが発生しました: {result['error']}")
        return
    
    print("✓ データ取得成功")
    print()
    
    # 結果のサマリー表示
    print("=" * 80)
    print("結果サマリー")
    print("=" * 80)
    print(f"場所: {result.get('place', 'N/A')}")
    print(f"イベント日: {result.get('event_date', 'N/A')}")
    print(f"前週同曜日: {result.get('prev_week_date', 'N/A')}")
    print(f"翌週同曜日: {result.get('next_week_date', 'N/A')}")
    print()
    
    # 時間別データの確認
    event_hourly = result.get('event_hourly', [])
    prev_week_hourly = result.get('prev_week_hourly', [])
    next_week_hourly = result.get('next_week_hourly', [])
    
    print(f"イベント当日の時間データ数: {len(event_hourly)}")
    print(f"前週の時間データ数: {len(prev_week_hourly)}")
    print(f"翌週の時間データ数: {len(next_week_hourly)}")
    print()
    
    # サマリー情報
    summary = result.get('summary', {})
    if summary:
        print("全体サマリー:")
        print(f"  イベント当日合計: {summary.get('event_total', 0):,}人")
        print(f"  前週合計: {summary.get('prev_week_total', 0):,}人")
        print(f"  翌週合計: {summary.get('next_week_total', 0):,}人")
        print(f"  前週・翌週平均: {summary.get('average_total', 0):,}人")
        print(f"  増加率: {summary.get('total_increase_rate', 0)}%")
        print()
    
    # イベント当日の時間別データ（サンプル）
    if event_hourly:
        print("イベント当日の時間別データ（サンプル）:")
        increase_rates = result.get('increase_rates', [])
        for i, hour_data in enumerate(event_hourly[:5]):  # 最初の5時間分
            hour = hour_data.get('hour')
            count = hour_data.get('count', 0)
            congestion = hour_data.get('congestion', 0)
            increase_rate = increase_rates[i].get('increase_rate', 0) if i < len(increase_rates) else 0
            print(f"  {hour}時: {count:,}人 (混雑度: {congestion}/10, 増加率: {increase_rate:+.1f}%)")
        if len(event_hourly) > 5:
            print(f"  ... 他 {len(event_hourly) - 5} 時間")
        print()
    
    # JSON出力（デバッグ用）
    print("=" * 80)
    print("完全なJSON出力（最初の100文字）:")
    print("=" * 80)
    json_str = json.dumps(result, ensure_ascii=False, indent=2)
    print(json_str[:500] + "...")
    print()
    
    # 検証
    print("=" * 80)
    print("検証結果")
    print("=" * 80)
    
    checks = [
        ("イベント日付が設定されている", bool(result.get('event_date'))),
        ("時間別データが存在する", len(event_hourly) > 0),
        ("増加率が計算されている", len(result.get('increase_rates', [])) > 0),
        ("サマリーが存在する", bool(summary)),
        ("合計人数がある", summary.get('event_total', 0) > 0 if summary else False),
    ]
    
    all_passed = True
    for check_name, passed in checks:
        status = "✓" if passed else "❌"
        print(f"{status} {check_name}")
        if not passed:
            all_passed = False
    
    print()
    if all_passed:
        print("✅ すべての検証に合格しました！")
    else:
        print("⚠️ いくつかの検証に失敗しました")
    
    return result

if __name__ == "__main__":
    test_event_effect()

