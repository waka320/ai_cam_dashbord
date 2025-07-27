import pandas as pd
import os
from datetime import datetime
from typing import List, Dict, Optional, Any

class WeatherService:
    def __init__(self):
        self.weather_data_path = "app/data/weather/past_weather.csv"
        self._weather_df = None
        self._load_weather_data()
    
    def _load_weather_data(self):
        """天気データをロードする"""
        if os.path.exists(self.weather_data_path):
            try:
                self._weather_df = pd.read_csv(self.weather_data_path)
                # 日付と時刻の変換
                self._weather_df['datetime'] = pd.to_datetime(
                    self._weather_df['date'] + ' ' + self._weather_df['time'].str.replace('時', ':00'),
                    format='%Y-%m-%d %H:%M'
                )
                # 温度データのクリーンアップ - 数値変換可能なもののみ保持
                self._weather_df['tempriture'] = pd.to_numeric(self._weather_df['tempriture'], errors='coerce')
                # 降水量データのクリーンアップ
                self._weather_df['rain'] = pd.to_numeric(self._weather_df['rain'], errors='coerce')
                # 不要な列を削除し、データをクリーンアップ
                self._weather_df = self._weather_df.dropna(subset=['weather'])
                print(f"Weather data loaded successfully: {len(self._weather_df)} records")
            except Exception as e:
                print(f"Error loading weather data: {e}")
                self._weather_df = None
        else:
            print(f"Weather data file not found: {self.weather_data_path}")
            self._weather_df = None
    
    def get_weather_for_date_range(self, year: int, month: int) -> List[Dict[str, Any]]:
        """指定された年月の天気データを取得"""
        if self._weather_df is None:
            return []
        
        try:
            # 指定された年月でフィルタリング
            filtered_df = self._weather_df[
                (self._weather_df['datetime'].dt.year == year) &
                (self._weather_df['datetime'].dt.month == month)
            ]
            
            if filtered_df.empty:
                return []
            
            # 日付ごとの天気データを作成
            weather_data = []
            for _, row in filtered_df.iterrows():
                weather_info = {
                    'date': row['datetime'].strftime('%Y-%m-%d'),
                    'time': row['datetime'].strftime('%H:%M'),
                    'hour': row['datetime'].hour,
                    'day': row['datetime'].day,
                    'weather': row['weather'],
                    'temperature': row['tempriture'] if pd.notna(row['tempriture']) else None,
                    'rain': row['rain'] if pd.notna(row['rain']) and row['rain'] != '--' else None,
                    'sun': row['sun'] if pd.notna(row['sun']) else None
                }
                weather_data.append(weather_info)
            
            return weather_data
            
        except Exception as e:
            print(f"Error getting weather data for {year}/{month}: {e}")
            return []
    
    def get_daily_weather_summary(self, year: int, month: int) -> List[Dict[str, Any]]:
        """指定された年月の日別天気サマリーを取得"""
        if self._weather_df is None:
            return []
        
        try:
            # 指定された年月でフィルタリング
            filtered_df = self._weather_df[
                (self._weather_df['datetime'].dt.year == year) &
                (self._weather_df['datetime'].dt.month == month)
            ]
            
            if filtered_df.empty:
                return []
            
            # 日付ごとにグループ化して代表的な天気を取得
            daily_summary = []
            for day in filtered_df['datetime'].dt.day.unique():
                day_data = filtered_df[filtered_df['datetime'].dt.day == day]
                
                # 最も頻繁に出現する天気を取得
                most_common_weather = day_data['weather'].mode()
                weather = most_common_weather[0] if not most_common_weather.empty else '不明'
                
                # 平均気温を計算
                avg_temp = day_data['tempriture'].mean() if day_data['tempriture'].notna().any() else None
                
                # 降水量の合計
                total_rain = day_data['rain'].sum() if day_data['rain'].notna().any() else None
                
                daily_summary.append({
                    'day': int(day),
                    'date': f"{year}-{month:02d}-{day:02d}",
                    'weather': weather,
                    'avg_temperature': round(avg_temp, 1) if avg_temp is not None else None,
                    'total_rain': round(total_rain, 1) if total_rain is not None else None
                })
            
            # 日付順でソート
            daily_summary.sort(key=lambda x: x['day'])
            return daily_summary
            
        except Exception as e:
            print(f"Error getting daily weather summary for {year}/{month}: {e}")
            return []
    
    def get_hourly_weather_for_day(self, year: int, month: int, day: int) -> List[Dict[str, Any]]:
        """指定された日の時間別天気データを取得"""
        if self._weather_df is None:
            return []
        
        try:
            # 指定された日でフィルタリング
            filtered_df = self._weather_df[
                (self._weather_df['datetime'].dt.year == year) &
                (self._weather_df['datetime'].dt.month == month) &
                (self._weather_df['datetime'].dt.day == day)
            ]
            
            if filtered_df.empty:
                return []
            
            hourly_data = []
            for _, row in filtered_df.iterrows():
                hourly_data.append({
                    'hour': row['datetime'].hour,
                    'weather': row['weather'],
                    'temperature': row['tempriture'] if pd.notna(row['tempriture']) else None,
                    'rain': row['rain'] if pd.notna(row['rain']) and row['rain'] != '--' else None,
                    'sun': row['sun'] if pd.notna(row['sun']) else None
                })
            
            # 時間順でソート
            hourly_data.sort(key=lambda x: x['hour'])
            return hourly_data
            
        except Exception as e:
            print(f"Error getting hourly weather for {year}/{month}/{day}: {e}")
            return []
    
    def get_weather_for_week_time(self, year: int, month: int) -> Dict[int, List[Dict[str, Any]]]:
        """指定された年月の曜日別・時間別天気データを取得"""
        if self._weather_df is None:
            return {}
        
        try:
            # 指定された年月でフィルタリング
            filtered_df = self._weather_df[
                (self._weather_df['datetime'].dt.year == year) &
                (self._weather_df['datetime'].dt.month == month)
            ]
            
            if filtered_df.empty:
                return {}
            
            # 曜日別にグループ化
            filtered_df['weekday'] = filtered_df['datetime'].dt.weekday
            
            weekday_weather = {}
            for weekday in range(7):  # 0:月曜〜6:日曜
                weekday_data = filtered_df[filtered_df['weekday'] == weekday]
                if not weekday_data.empty:
                    # 時間別の代表的な天気を取得
                    hourly_weather = []
                    for hour in range(7, 23):  # 7時から22時まで
                        hour_data = weekday_data[weekday_data['datetime'].dt.hour == hour]
                        if not hour_data.empty:
                            # 最も頻繁に出現する天気を取得
                            most_common_weather = hour_data['weather'].mode()
                            weather = most_common_weather[0] if not most_common_weather.empty else '不明'
                            avg_temp = hour_data['tempriture'].mean() if hour_data['tempriture'].notna().any() else None
                            avg_rain = hour_data['rain'].mean() if hour_data['rain'].notna().any() else None
                            
                            hourly_weather.append({
                                'hour': hour,
                                'weather': weather,
                                'avg_temperature': round(avg_temp, 1) if avg_temp is not None else None,
                                'avg_rain': round(avg_rain, 1) if avg_rain is not None else None
                            })
                    
                    weekday_weather[weekday] = hourly_weather
            
            return weekday_weather
            
        except Exception as e:
            print(f"Error getting weather for week time {year}/{month}: {e}")
            return {}
    
    def get_weather_for_date_time(self, year: int, month: int) -> Dict[int, List[Dict[str, Any]]]:
        """指定された年月の日付別・時間別天気データを取得"""
        if self._weather_df is None:
            return {}
        
        try:
            # 指定された年月でフィルタリング
            filtered_df = self._weather_df[
                (self._weather_df['datetime'].dt.year == year) &
                (self._weather_df['datetime'].dt.month == month)
            ]
            
            if filtered_df.empty:
                return {}
            
            # 日付別にグループ化
            date_weather = {}
            for day in filtered_df['datetime'].dt.day.unique():
                day_data = filtered_df[filtered_df['datetime'].dt.day == day]
                
                # 時間別の天気データを取得
                hourly_weather = []
                for hour in range(7, 23):  # 7時から22時まで
                    hour_data = day_data[day_data['datetime'].dt.hour == hour]
                    if not hour_data.empty:
                        # 最新の天気データを取得
                        latest_weather = hour_data.iloc[-1]
                        hourly_weather.append({
                            'hour': hour,
                            'weather': latest_weather['weather'],
                            'temperature': latest_weather['tempriture'] if pd.notna(latest_weather['tempriture']) else None,
                            'rain': latest_weather['rain'] if pd.notna(latest_weather['rain']) else None
                        })
                
                date_weather[int(day)] = hourly_weather
            
            return date_weather
            
        except Exception as e:
            print(f"Error getting weather for date time {year}/{month}: {e}")
            return {}

# メイン実行時の処理
if __name__ == "__main__":
    # 天気データの更新処理
    print("Starting weather service update...")
    weather_service = WeatherService()
    print("Weather service initialized.")
    
    if weather_service._weather_df is not None:
        print(f"Weather data loaded: {len(weather_service._weather_df)} records")
        print("Weather service update completed successfully.")
    else:
        print("Warning: No weather data loaded.")
else:
    # モジュールとしてインポートされた場合のサービスインスタンス作成
    weather_service = WeatherService()
