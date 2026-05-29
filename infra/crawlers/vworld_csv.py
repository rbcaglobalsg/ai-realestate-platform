#!/usr/bin/env python3
"""
VWorld 데이터 CSV 크롤러
- 월간 토지 데이터 CSV 다운로드
- 월간 건물 데이터 CSV 다운로드

환경변수:
    VWORLD_API_KEY: VWorld API 키 (vworld.kr에서 발급)

사용법:
    python vworld_csv.py                  # 전체 크롤링 실행
    python vworld_csv.py --type land       # 토지 데이터만 크롤링
    python vworld_csv.py --type building   # 건물 데이터만 크롤링
    python vworld_csv.py --year 2024       # 2024년 데이터만 크롤링
"""

import os
import sys
import argparse
import logging
import re
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
import pandas as pd
from dotenv import load_dotenv

# ─── 로깅 설정 ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ─── 환경변수 로드 ────────────────────────────────────────────────────────────
load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "raw"
DATA_DIR.mkdir(parents=True, exist_ok=True)

VWORLD_API_KEY = os.getenv("VWORLD_API_KEY", "")

# ─── VWorld API 설정 ─────────────────────────────────────────────────────────
VWORLD_BASE_URL = "https://www.vworld.kr"
VWORLD_DATA_URL = "https://www.vworld.kr/dtmk/dtmk_ntwrk_s001.do"

# VWorld Open API 엔드포인트
VWORLD_API_URL = "https://api.vworld.kr/req/data"

# 데이터셋 정의
VWORLD_DATASETS = {
    "land": {
        "name": "토지",
        "data_id": "LT_C_ADEMD_INFO",
        "description": "월간 토지 데이터",
    },
    "building": {
        "name": "건물",
        "data_id": "LT_C_BULD_INFO",
        "description": "월간 건물 데이터",
    },
}

# ─── VWorld API 호출 ──────────────────────────────────────────────────────────
def fetch_vworld_api(dataset_id: str, page: int = 1, page_size: int = 1000, **filters) -> dict:
    """
    VWorld Open API를 통한 데이터 조회

    Args:
        dataset_id: 데이터셋 ID
        page: 페이지 번호
        page_size: 페이지당 건수
        **filters: 추가 필터 파라미터

    Returns:
        API 응답 딕셔너리

    Raises:
        ValueError: API 키가 설정되지 않은 경우
    """
    if not VWORLD_API_KEY:
        raise ValueError(
            "VWORLD_API_KEY가 설정되지 않았습니다. "
            ".env 파일 또는 환경변수를 확인하세요."
        )

    params = {
        "key": VWORLD_API_KEY,
        "request": "GetFeature",
        "data": dataset_id,
        "page": page,
        "size": page_size,
        "format": "json",
        "crs": "EPSG:4326",
    }

    # 추가 필터 적용
    params.update(filters)

    logger.info(f"VWorld API 호출: 데이터셋={dataset_id}, 페이지={page}")

    response = requests.get(VWORLD_API_URL, params=params, timeout=60)
    response.raise_for_status()

    data = response.json()

    # 응답 상태 확인
    status = data.get("response", {}).get("status", "")
    if status != "OK":
        error_msg = data.get("response", {}).get("error", "알 수 없는 오류")
        logger.warning(f"VWorld API 오류 - 상태: {status}, 메시지: {error_msg}")

    return data


# ─── VWorld CSV 다운로드 (웹 스크래핑) ────────────────────────────────────────
def find_csv_download_links(data_type: str, year: int = None) -> list:
    """
    VWorld 웹사이트에서 CSV 다운로드 링크 탐색

    Args:
        data_type: 데이터 유형 ("land" 또는 "building")
        year: 수집 연도

    Returns:
        다운로드 링크 목록
    """
    if not year:
        year = datetime.now().year

    dataset = VWORLD_DATASETS.get(data_type)
    if not dataset:
        raise ValueError(f"지원하지 않는 데이터 유형: {data_type}")

    logger.info(f"[{dataset['name']}] CSV 다운로드 링크 탐색 시작 - 연도: {year}")

    links = []

    try:
        # VWorld 데이터 목록 페이지 요청
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        })

        # 데이터 검색 페이지
        search_params = {
            "dmSrchGbn": "T",
            "dmSrchTxt": dataset["name"],
        }

        response = session.get(VWORLD_DATA_URL, params=search_params, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # CSV 다운로드 링크 찾기
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            link_text = a_tag.get_text(strip=True)

            # CSV 또는 다운로드 관련 링크 필터링
            is_csv = any(ext in href.lower() for ext in [".csv", ".zip", "download", "dataLink"])
            is_relevant = dataset["name"] in link_text or str(year) in link_text

            if is_csv or is_relevant:
                full_url = urljoin(VWORLD_BASE_URL, href)
                links.append({
                    "url": full_url,
                    "text": link_text,
                    "data_type": data_type,
                })
                logger.info(f"다운로드 링크 발견: {link_text} -> {full_url}")

    except requests.RequestException as e:
        logger.error(f"VWorld 웹페이지 접근 실패: {e}")

    if not links:
        logger.warning(f"[{dataset['name']}] 다운로드 링크를 찾을 수 없습니다.")

    return links


# ─── VWorld API 데이터 → CSV 저장 ─────────────────────────────────────────────
def fetch_and_save_vworld_data(data_type: str, year: str = None) -> Path:
    """
    VWorld API에서 데이터를 조회하고 CSV로 저장

    Args:
        data_type: 데이터 유형 ("land" 또는 "building")
        year: 수집 연도 (기본값: 현재 연도)

    Returns:
        저장된 CSV 파일 경로
    """
    if not year:
        year = str(datetime.now().year)

    dataset = VWORLD_DATASETS.get(data_type)
    if not dataset:
        raise ValueError(f"지원하지 않는 데이터 유형: {data_type}")

    logger.info(f"[{dataset['name']}] VWorld API 데이터 수집 시작")

    all_features = []
    page = 1

    while True:
        try:
            data = fetch_vworld_api(
                dataset_id=dataset["data_id"],
                page=page,
                page_size=1000,
            )

            result = data.get("response", {}).get("result", {})
            feature_collection = result.get("featureCollection", {})
            features = feature_collection.get("features", [])

            if not features:
                logger.info(f"페이지 {page}: 데이터 없음, 수집 종료")
                break

            all_features.extend(features)

            # 페이지네이션 정보
            total = result.get("totalFeatures", 0)
            logger.info(f"페이지 {page}: {len(features)}건 수집 (총 {len(all_features)}/{total})")

            if len(all_features) >= total:
                break

            page += 1
            time.sleep(0.5)  # API 호출 간격 조절

        except Exception as e:
            logger.error(f"페이지 {page} 수집 실패: {e}")
            break

    if not all_features:
        logger.warning(f"[{dataset['name']}] 수집된 데이터 없음")
        return None

    # GeoJSON Feature 속성을 DataFrame으로 변환
    records = []
    for feature in all_features:
        properties = feature.get("properties", {})
        geometry = feature.get("geometry", {})

        record = {**properties}

        # 좌표 정보 추가
        if geometry.get("type") == "Point" and geometry.get("coordinates"):
            coords = geometry["coordinates"]
            record["longitude"] = coords[0]
            record["latitude"] = coords[1]

        records.append(record)

    df = pd.DataFrame(records)
    logger.info(f"[{dataset['name']}] 총 {len(df)}건 수집 완료")

    # CSV 저장
    filepath = save_to_csv(df, f"vworld_{data_type}_{year}")
    return filepath


# ─── CSV 다운로드 (직접 링크) ────────────────────────────────────────────────
def download_csv_file(url: str, filename: str) -> Path:
    """
    URL에서 CSV 파일을 직접 다운로드

    Args:
        url: 다운로드 URL
        filename: 저장할 파일명

    Returns:
        저장된 파일 경로
    """
    logger.info(f"CSV 파일 다운로드: {url}")

    try:
        response = requests.get(
            url,
            timeout=120,
            stream=True,
            headers={"User-Agent": "Mozilla/5.0"},
        )
        response.raise_for_status()

        filepath = DATA_DIR / filename

        with open(filepath, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        logger.info(f"다운로드 완료: {filepath}")

        # ZIP 파일인 경우 압축 해제 시도
        if filename.endswith(".zip"):
            _extract_zip(filepath)

        return filepath

    except Exception as e:
        logger.error(f"CSV 다운로드 실패: {e}")
        raise


def _extract_zip(zip_path: Path):
    """ZIP 파일 압축 해제"""
    import zipfile

    extract_dir = zip_path.parent / zip_path.stem
    extract_dir.mkdir(exist_ok=True)

    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(extract_dir)

    logger.info(f"압축 해제 완료: {extract_dir}")


# ─── CSV 저장 (공통) ─────────────────────────────────────────────────────────
def save_to_csv(df: pd.DataFrame, filename: str) -> Path:
    """
    DataFrame을 CSV 파일로 저장

    Args:
        df: 저장할 DataFrame
        filename: 파일명 (확장자 제외)

    Returns:
        저장된 파일 경로
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = DATA_DIR / f"{filename}_{timestamp}.csv"

    df.to_csv(filepath, index=False, encoding="utf-8-sig")
    logger.info(f"CSV 저장 완료: {filepath} ({len(df)}행)")

    return filepath


# ─── 전체 크롤링 실행 ────────────────────────────────────────────────────────
def run_all_crawlers(year: str = None) -> dict:
    """
    모든 VWorld 크롤러를 순차 실행

    Args:
        year: 수집 연도 (기본값: 현재 연도)

    Returns:
        수집 결과 요약 딕셔너리 {유형: 파일경로}
    """
    if not year:
        year = str(datetime.now().year)

    results = {}

    for data_type, info in VWORLD_DATASETS.items():
        try:
            logger.info(f"{'='*60}")
            logger.info(f"[{info['name']}] 크롤링 시작")

            # 1차: VWorld Open API로 데이터 수집 시도
            filepath = fetch_and_save_vworld_data(data_type, year=year)

            if filepath:
                results[f"VWorld_{info['name']}_API"] = str(filepath)
            else:
                # 2차: 웹 스크래핑으로 CSV 다운로드 링크 탐색
                logger.info(f"[{info['name']}] API 수집 실패, 웹 스크래핑 시도")
                links = find_csv_download_links(data_type, int(year))

                if links:
                    for i, link in enumerate(links[:3]):  # 최대 3개 링크까지만 시도
                        try:
                            filename = f"vworld_{data_type}_{year}_source{i+1}.csv"
                            filepath = download_csv_file(link["url"], filename)
                            results[f"VWorld_{info['name']}_CSV_{i+1}"] = str(filepath)
                        except Exception as e:
                            logger.warning(f"다운로드 실패 ({link['text']}): {e}")
                else:
                    logger.warning(f"[{info['name']}] 수집 방법 없음")

        except Exception as e:
            logger.error(f"[{info['name']}] 크롤링 실패: {e}")
            results[f"VWorld_{info['name']}"] = f"실패: {e}"

    # 결과 요약
    logger.info(f"{'='*60}")
    logger.info("크롤링 결과 요약:")
    for key, value in results.items():
        logger.info(f"  {key}: {value}")

    return results


# ─── 메인 실행 ────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="VWorld 데이터 CSV 크롤러")
    parser.add_argument(
        "--type",
        choices=["land", "building", "all"],
        default="all",
        help="크롤링할 데이터 유형 (기본값: all)",
    )
    parser.add_argument(
        "--year",
        type=str,
        default=str(datetime.now().year),
        help="수집 연도 (기본값: 현재 연도)",
    )

    args = parser.parse_args()

    logger.info("VWorld 크롤러 시작")
    logger.info(f"수집 연도: {args.year}")

    if args.type == "all":
        run_all_crawlers(year=args.year)
    else:
        fetch_and_save_vworld_data(args.type, year=args.year)

    logger.info("크롤링 완료")


if __name__ == "__main__":
    main()
