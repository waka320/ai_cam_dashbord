#!/usr/bin/env python3
"""
Google Sheetsからイベントデータを同期するスクリプト

使用例:
    python sync_events.py

環境変数:
    GOOGLE_SHEETS_ID: Google SheetsのID
    GOOGLE_SHEETS_CREDENTIALS: サービスアカウントのJSON認証情報
"""

import sys
import os

# プロジェクトルートをパスに追加
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.csv_events_service import csv_events_service


def main():
    """メイン関数"""
    print("🔄 Google Sheetsからイベントデータを同期中...")
    
    try:
        # 詳細な結果を取得
        result = csv_events_service.sync_from_google_sheets_with_validation()
        
        if result["success"]:
            print(f"✅ 同期成功!")
            print(f"   📊 同期行数: {result['rows_synced']}")
            print(f"   ✅ 有効イベント数: {result['valid_events']}")
            print(f"   🕐 同期時刻: {result['sync_time']}")
            
            if result['rows_synced'] > result['valid_events']:
                invalid_count = result['rows_synced'] - result['valid_events']
                print(f"   ⚠️  無効な行: {invalid_count} (スキップされました)")
            
        else:
            print(f"❌ 同期失敗: {result['error']}")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ 予期しないエラー: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
