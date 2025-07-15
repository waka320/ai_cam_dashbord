#!/usr/bin/env python3
"""
傾向分析エンドポイントのテストスクリプト
"""

import sys
import os
sys.path.append('/Users/WakaY/Desktop/new_dashbord/backend')

from app.services.analyze.get_trend_analysis import get_congestion_data
from datetime import datetime

def test_congestion_data():
    """混雑度データ取得機能をテストする"""
    print("=== 混雑度データ取得テストを開始 ===")
    
    # テスト用のファイルパス
    test_files = [
        "/Users/WakaY/Desktop/new_dashbord/backend/app/data/meidai/yasukawadori.csv",
        "/Users/WakaY/Desktop/new_dashbord/backend/app/data/meidai/honmachi2.csv"
    ]
    
    for test_file in test_files:
        if os.path.exists(test_file):
            place_name = os.path.splitext(os.path.basename(test_file))[0]
            print(f"\n--- {place_name} の混雑度データ取得 ---")
            
            try:
                # 混雑度データを取得
                result = get_congestion_data(test_file)
                
                if result:
                    print(f"✅ データ取得成功: {place_name}")
                    print(f"分析日: {result.get('analysis_date')}")
                    
                    # 直近週の混雑度
                    recent = result.get('recent_week', {})
                    if recent:
                        daily_data = recent.get('daily_data', [])
                        print(f"直近週のデータ数: {len(daily_data)}日")
                        if daily_data:
                            print(f"最新日の混雑度: {daily_data[-1].get('congestion_level', 'N/A')}")
                    
                    # 前年データの有無
                    historical = result.get('historical_comparison', {})
                    if historical.get('data_available'):
                        hist_data = historical.get('daily_data', [])
                        print(f"前年データ: {len(hist_data)}日分利用可能")
                        if hist_data:
                            reference_day = next((d for d in hist_data if d.get('days_from_reference') == 0), None)
                            if reference_day:
                                print(f"前年同日の混雑度: {reference_day.get('congestion_level', 'N/A')}")
                    else:
                        print("前年データ: 利用不可")
                    
                else:
                    print(f"❌ データ取得失敗: {place_name} - 結果なし")
                    
            except Exception as e:
                print(f"❌ データ取得失敗: {place_name} - エラー: {e}")
        else:
            print(f"⚠️  ファイルが見つかりません: {test_file}")
    
    print("\n=== 混雑度データ取得テスト完了 ===")

if __name__ == "__main__":
    test_congestion_data()
