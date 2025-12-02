import csv
from pathlib import Path
from typing import Any, Dict, List, Optional


MONTH_LABELS = [f"{month}月" for month in range(1, 13)]


def _safe_int(value: Any) -> int:
    """文字列を安全に整数へ変換（カンマや空文字にも対応）。"""
    if value is None:
        return 0
    try:
        cleaned = str(value).replace(",", "").strip()
        return int(cleaned) if cleaned else 0
    except (ValueError, TypeError):
        return 0


class ForeignersStatsService:
    """
    高山市の外国人宿泊データから
    「指定月の国別ランキング」を返すためのサービス。
    """

    def __init__(self, data_dir: Optional[Path] = None) -> None:
        self.data_dir = Path(data_dir) if data_dir else Path("app/data/foreigners")

    def get_monthly_ranking(
        self, month: int, year: Optional[str], top_n: int
    ) -> Dict[str, Any]:
        if not 1 <= month <= 12:
            raise ValueError("month は 1〜12 の整数で指定してください。")

        entries = self._load_year_entries()
        available_years = [entry["year"] for entry in entries]

        if year:
            selected_entry = next(
                (entry for entry in entries if entry["year"] == year),
                None,
            )
            # 指定された年度のデータがない場合、利用可能な年度の中で最も近い年度を使用
            if selected_entry is None:
                # 年度の数値部分を抽出して比較
                target_year_num = self._parse_year_order(year)
                # 最も近い年度を探す（数値が近い順）
                selected_entry = min(
                    entries,
                    key=lambda e: abs(self._parse_year_order(e["year"]) - target_year_num)
                )
        else:
            selected_entry = entries[0]

        ranking = self._build_monthly_ranking(selected_entry, month, top_n)

        return {
            "year": selected_entry["year"],
            "available_years": available_years,
            "month": month,
            "month_label": MONTH_LABELS[month - 1],
            **ranking,
        }

    def _load_year_entries(self) -> List[Dict[str, Any]]:
        csv_paths = sorted(self.data_dir.glob("*外国人観光客宿泊者数*.csv"))
        if not csv_paths:
            raise FileNotFoundError("外国人宿泊データのCSVが見つかりません。")

        entries = [self._parse_csv_file(path) for path in csv_paths]
        entries.sort(key=lambda entry: entry["sort_key"], reverse=True)
        return entries

    def _parse_csv_file(self, csv_path: Path) -> Dict[str, Any]:
        year_label = self._extract_year_label(csv_path.stem)
        countries: List[Dict[str, Any]] = []
        month_totals = [0] * len(MONTH_LABELS)

        with csv_path.open(encoding="utf-8-sig") as file:
            reader = csv.reader(file)
            next(reader, None)  # ヘッダーをスキップ

            for row in reader:
                if not any(row):
                    continue

                region = row[0].strip() if len(row) > 0 and row[0] else ""
                country = row[1].strip() if len(row) > 1 and row[1] else ""
                monthly_values = self._normalize_monthly(row[2:])

                if region == "合計":
                    month_totals = monthly_values
                    continue

                if self._is_summary_row(country):
                    continue

                normalized_region = region if region else "未分類"
                countries.append(
                    {
                        "country": country or normalized_region,
                        "region": normalized_region,
                        "monthly": monthly_values,
                    }
                )

        if not countries:
            raise ValueError(f"{csv_path.name} に処理可能なデータがありません。")

        if not any(month_totals):
            month_totals = self._aggregate_monthly(countries)

        return {
            "year": year_label,
            "countries": countries,
            "month_totals": month_totals,
            "sort_key": self._parse_year_order(year_label),
        }

    def _build_monthly_ranking(
        self, entry: Dict[str, Any], month: int, top_n: int
    ) -> Dict[str, Any]:
        month_index = month - 1
        ranking_rows = []

        for country in entry["countries"]:
            # 「不明」を除外
            country_name = country["country"].strip()
            if country_name == "不明" or country_name == "その他" or country_name == "":
                continue
            
            guests = country["monthly"][month_index]
            ranking_rows.append(
                {
                    "country": country["country"],
                    "region": country["region"],
                    "guests": guests,
                }
            )

        ranking_rows.sort(key=lambda item: item["guests"], reverse=True)
        total_guests = entry["month_totals"][month_index]
        if total_guests == 0:
            total_guests = sum(item["guests"] for item in ranking_rows)

        for rank, item in enumerate(ranking_rows, start=1):
            share = (item["guests"] / total_guests * 100) if total_guests else 0
            item["share_pct"] = round(share, 2) if total_guests else None
            item["rank"] = rank

        limited = ranking_rows[: max(1, top_n)]

        return {
            "total_guests": total_guests,
            "ranking": limited,
            "total_countries": len(ranking_rows),
        }

    @staticmethod
    def _normalize_monthly(values: List[Any]) -> List[int]:
        normalized = []
        for idx in range(len(MONTH_LABELS)):
            normalized.append(_safe_int(values[idx]) if idx < len(values) else 0)
        return normalized

    @staticmethod
    def _is_summary_row(country_label: str) -> bool:
        if not country_label:
            return False
        normalized = country_label.replace(" ", "")
        return "計" in normalized or normalized == "合計"

    @staticmethod
    def _aggregate_monthly(countries: List[Dict[str, Any]]) -> List[int]:
        totals = [0] * len(MONTH_LABELS)
        for country in countries:
            for idx, value in enumerate(country["monthly"]):
                totals[idx] += value
        return totals

    @staticmethod
    def _parse_year_order(label: str) -> int:
        digits = "".join(char for char in label if char.isdigit())
        return int(digits) if digits else 0

    @staticmethod
    def _extract_year_label(stem: str) -> str:
        if "高山市" in stem:
            return stem.split("高山市")[0]
        return stem


foreigners_stats_service = ForeignersStatsService()

