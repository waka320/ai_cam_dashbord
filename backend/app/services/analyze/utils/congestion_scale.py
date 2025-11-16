from __future__ import annotations

from typing import List

TOTAL_CONGESTION_LEVELS = 20
_EPSILON = 1e-6


def _adjust_middle(min_threshold: float, middle_threshold: float, max_threshold: float) -> float:
    """
    middle が min/max と同値にならないよう安全にクランプする
    """
    max_threshold = max(max_threshold, min_threshold + 1)
    middle_threshold = middle_threshold if middle_threshold is not None else (min_threshold + max_threshold) / 2
    middle_threshold = max(middle_threshold, min_threshold + _EPSILON)
    middle_threshold = min(middle_threshold, max_threshold - _EPSILON)
    return middle_threshold


def build_congestion_bins(
    min_threshold: float,
    middle_threshold: float,
    max_threshold: float,
    total_levels: int = TOTAL_CONGESTION_LEVELS,
) -> List[float]:
    """
    0（データなし）と total_levels（最大混雑）を含む単調増加の bin を生成する
    """
    min_threshold = float(min_threshold)
    max_threshold = float(max_threshold)
    if max_threshold <= min_threshold:
        max_threshold = min_threshold + 1

    middle_threshold = _adjust_middle(min_threshold, middle_threshold, max_threshold)

    bins: List[float] = [0.0, 1.0, float(min_threshold)]
    last = bins[-1]

    dynamic_levels = max(total_levels - 2, 1)  # <min と >=max を除いたレベル数
    lower_segments = dynamic_levels // 2
    upper_segments = dynamic_levels - lower_segments

    # 下側の境界
    if lower_segments > 0:
        step_lower = max((middle_threshold - min_threshold) / lower_segments, _EPSILON)
        for i in range(1, lower_segments):
            val = min_threshold + i * step_lower
            if val <= last:
                val = last + _EPSILON
            bins.append(float(val))
            last = val

    # middle 境界
    if middle_threshold <= last:
        middle_threshold = last + _EPSILON
    bins.append(float(middle_threshold))
    last = middle_threshold

    # 上側の境界
    if upper_segments > 0:
        step_upper = max((max_threshold - middle_threshold) / upper_segments, _EPSILON)
        for i in range(1, upper_segments):
            val = middle_threshold + i * step_upper
            if val <= last:
                val = last + _EPSILON
            bins.append(float(val))
            last = val

    # max 境界
    if max_threshold <= last:
        max_threshold = last + _EPSILON
    bins.append(float(max_threshold))

    # 最上限
    bins.append(float("inf"))
    return bins


def calculate_scaled_level(
    count: float,
    min_threshold: float,
    max_threshold: float,
    total_levels: int = TOTAL_CONGESTION_LEVELS,
) -> int:
    """
    min_threshold〜max_threshold を total_levels に線形マッピングした混雑度を返す
    """
    if count is None or count <= 0:
        return 0

    min_threshold = float(min_threshold)
    max_threshold = float(max_threshold)
    if max_threshold <= min_threshold:
        max_threshold = min_threshold + 1

    if count < min_threshold:
        return 1

    if count >= max_threshold:
        return total_levels

    span = max_threshold - min_threshold
    step = span / (total_levels - 1)
    if step <= 0:
        return total_levels

    level = int((count - min_threshold) / step) + 1
    return min(max(level, 1), total_levels)

