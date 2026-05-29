#!/usr/bin/env python3
"""
공공데이터 API 크롤러
- 국토교통부 실거래가 API (아파트매매, 단독다가구, 연립다세대)
- 건축물대장 API

환경변수:
    PUBLIC_DATA_API_KEY: 공공데이터포털 API 키 (data.go.kr에서 발급)

사용법:
    python public_data.py                  # 전체 크롤링 실행
    python public_data.py --type apartment  # 아파트매매만 크롤링
    python public_data.py --year 2024       # 2024년 데이터만 크롤링
"""

import os
import sys
import argparse
import logging
from datetime import datetime
from pathlib import Path

import requests
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

PUBLIC_DATA_API_KEY = os.getenv("PUBLIC_DATA_API_KEY", "")

# ─── API 엔드포인트 정의 ─────────────────────────────────────────────────────
# 국토교통부 실거래가 API 베이스 URL
REAL_ESTATE_BASE_URL = "http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSDataSvc"

# 실거래가 API 유형별 엔드포인트
REAL_ESTATE_ENDPOINTS = {
    "apartment": {
        "name": "아파트매매",
        "path": "RTMSDataSvcAptTrade",
        "description": "아파트 매매 실거래가",
    },
    "detached": {
        "name": "단독다가구",
        "path": "RTMSDataSvcSHTrade",
        "description": "단독/다가구 매매 실거래가",
    },
    "rowhouse": {
        "name": "연립다세대",
        "path": "RTMSDataSvcRHTrade",
        "description": "연립/다세대 매매 실거래가",
    },
}

# 건축물대장 API
BUILDING_BASE_URL = "http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/FCMDataSvc"
BUILDING_ENDPOINT = "FcMrhstInfo"  # 건축물대장 조회

# ─── 공통 API 호출 함수 ───────────────────────────────────────────────────────
def fetch_api(url: str, params: dict) -> dict:
    """
    공공데이터 API 호출

    Args:
        url: API 엔드포인트 URL
        params: 요청 파라미터

    Returns:
        API 응답 JSON 딕셔너리

    Raises:
        ValueError: API 키가 설정되지 않은 경우
        requests.HTTPError: HTTP 오류 발생 시
    """
    if not PUBLIC_DATA_API_KEY:
        raise ValueError(
            "PUBLIC_DATA_API_KEY가 설정되지 않았습니다. "
            ".env 파일 또는 환경변수를 확인하세요."
        )

    # 공통 파라미터 추가
    params.setdefault("serviceKey", PUBLIC_DATA_API_KEY)
    params.setdefault("_type", "json")

    logger.info(f"API 호출: {url} | 파라미터: {params}")

    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()

    data = response.json()

    # 응답 코드 확인
    result_code = data.get("response", {}).get("header", {}).get("resultCode", "")
    if result_code != "00":
        result_msg = data.get("response", {}).get("header", {}).get("resultMsg", "알 수 없는 오류")
        logger.warning(f"API 응답 오류 - 코드: {result_code}, 메시지: {result_msg}")

    return data


# ─── 실거래가 크롤링 ─────────────────────────────────────────────────────────
def fetch_real_estate_data(trade_type: str, lawd_cd: str = "11110", deal_ymd: str = "") -> pd.DataFrame:
    """
    국토교통부 실거래가 데이터 조회

    Args:
        trade_type: 거래 유형 ("apartment", "detached", "rowhouse")
        lawd_cd: 법정동 코드 (기본값: "11110" 서울 종로구)
        deal_ymd: 계약년월 (예: "202412", 기본값: 현재 연월)

    Returns:
        실거래가 DataFrame
    """
    if trade_type not in REAL_ESTATE_ENDPOINTS:
        raise ValueError(f"지원하지 않는 거래 유형: {trade_type}. 지원: {list(REAL_ESTATE_ENDPOINTS.keys())}")

    endpoint = REAL_ESTATE_ENDPOINTS[trade_type]
    url = f"{REAL_ESTATE_BASE_URL}/{endpoint['path']}"

    if not deal_ymd:
        deal_ymd = datetime.now().strftime("%Y%m")

    params = {
        "LAWD_CD": lawd_cd,
        "DEAL_YMD": deal_ymd,
        "numOfRows": 1000,
        "pageNo": 1,
    }

    logger.info(f"[{endpoint['name']}] 실거래가 데이터 수집 시작 - 법정동: {lawd_cd}, 연월: {deal_ymd}")

    # 페이지 순회로 전체 데이터 수집
    all_items = []
    page_no = 1

    while True:
        params["pageNo"] = page_no
        data = fetch_api(url, params)

        body = data.get("response", {}).get("body", {})
        items = body.get("items", {}).get("item", [])
        total_count = body.get("totalCount", 0)

        if not items:
            logger.info(f"페이지 {page_no}: 데이터 없음, 수집 종료")
            break

        # 단일 항목인 경우 리스트로 변환
        if isinstance(items, dict):
            items = [items]

        all_items.extend(items)
        logger.info(f"페이지 {page_no}: {len(items)}건 수집 (총 {len(all_items)}/{total_count})")

        # 전체 수집 완료 확인
        if len(all_items) >= total_count:
            break

        page_no += 1

    df = pd.DataFrame(all_items)
    logger.info(f"[{endpoint['name']}] 총 {len(df)}건 수집 완료")

    return df


# ─── 건축물대장 크롤링 ───────────────────────────────────────────────────────
def fetch_building_data(sigungu_cd: str = "11110", bjdong_cd: str = "00100", plat_plc: str = "") -> pd.DataFrame:
    """
    건축물대장 데이터 조회

    Args:
        sigungu_cd: 시군구 코드 (기본값: "11110" 종로구)
        bjdong_cd: 법정동 코드 (기본값: "00100")
        plat_plc: 대지위치 (선택)

    Returns:
        건축물대장 DataFrame
    """
    url = f"{BUILDING_BASE_URL}/{BUILDING_ENDPOINT}"

    params = {
        "sigunguCd": sigungu_cd,
        "bjdongCd": bjdong_cd,
        "numOfRows": 1000,
        "pageNo": 1,
    }

    if plat_plc:
        params["platPlc"] = plat_plc

    logger.info(f"[건축물대장] 데이터 수집 시작 - 시군구: {sigungu_cd}, 법정동: {bjdong_cd}")

    all_items = []
    page_no = 1

    while True:
        params["pageNo"] = page_no
        data = fetch_api(url, params)

        body = data.get("response", {}).get("body", {})
        items = body.get("items", {}).get("item", [])
        total_count = body.get("totalCount", 0)

        if not items:
            logger.info(f"페이지 {page_no}: 데이터 없음, 수집 종료")
            break

        if isinstance(items, dict):
            items = [items]

        all_items.extend(items)
        logger.info(f"페이지 {page_no}: {len(items)}건 수집 (총 {len(all_items)}/{total_count})")

        if len(all_items) >= total_count:
            break

        page_no += 1

    df = pd.DataFrame(all_items)
    logger.info(f"[건축물대장] 총 {len(df)}건 수집 완료")

    return df


# ─── CSV 저장 ─────────────────────────────────────────────────────────────────
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
def run_all_crawlers(year: str = None, lawd_cd: str = "11110") -> dict:
    """
    모든 공공데이터 크롤러를 순차 실행

    Args:
        year: 수집 연도 (기본값: 현재 연도)
        lawd_cd: 법정동 코드 (기본값: "11110" 서울 종로구)

    Returns:
        수집 결과 요약 딕셔너리 {유형: 파일경로}
    """
    if not year:
        year = str(datetime.now().year)

    results = {}

    # 실거래가 3종 크롤링
    for trade_type, info in REAL_ESTATE_ENDPOINTS.items():
        try:
            logger.info(f"{'='*60}")
            logger.info(f"[{info['name']}] 크롤링 시작")

            # 해당 연도의 모든 월 데이터 수집
            monthly_dfs = []
            for month in range(1, 13):
                deal_ymd = f"{year}{month:02d}"
                try:
                    df = fetch_real_estate_data(trade_type, lawd_cd=lawd_cd, deal_ymd=deal_ymd)
                    if not df.empty:
                        monthly_dfs.append(df)
                except Exception as e:
                    logger.warning(f"[{info['name']}] {deal_ymd} 데이터 수집 실패: {e}")
                    continue

            if monthly_dfs:
                combined_df = pd.concat(monthly_dfs, ignore_index=True)
                filepath = save_to_csv(combined_df, f"real_estate_{trade_type}_{year}")
                results[f"실거래가_{info['name']}"] = str(filepath)
            else:
                logger.warning(f"[{info['name']}] 수집된 데이터 없음")

        except Exception as e:
            logger.error(f"[{info['name']}] 크롤링 실패: {e}")
            results[f"실거래가_{info['name']}"] = f"실패: {e}"

    # 건축물대장 크롤링
    try:
        logger.info(f"{'='*60}")
        logger.info("[건축물대장] 크롤링 시작")

        building_df = fetch_building_data()
        if not building_df.empty:
            filepath = save_to_csv(building_df, f"building_register_{year}")
            results["건축물대장"] = str(filepath)
        else:
            logger.warning("[건축물대장] 수집된 데이터 없음")

    except Exception as e:
        logger.error(f"[건축물대장] 크롤링 실패: {e}")
        results["건축물대장"] = f"실패: {e}"

    # 결과 요약
    logger.info(f"{'='*60}")
    logger.info("크롤링 결과 요약:")
    for key, value in results.items():
        logger.info(f"  {key}: {value}")

    return results


# ─── 메인 실행 ────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="공공데이터 API 크롤러")
    parser.add_argument(
        "--type",
        choices=["apartment", "detached", "rowhouse", "building", "all"],
        default="all",
        help="크롤링할 데이터 유형 (기본값: all)",
    )
    parser.add_argument(
        "--year",
        type=str,
        default=str(datetime.now().year),
        help="수집 연도 (기본값: 현재 연도)",
    )
    parser.add_argument(
        "--lawd-cd",
        type=str,
        default="11110",
        help="법정동 코드 (기본값: 11110 서울 종로구)",
    )

    args = parser.parse_args()

    logger.info("공공데이터 크롤러 시작")
    logger.info(f"수집 연도: {args.year}, 법정동 코드: {args.lawd_cd}")

    if args.type == "all":
        run_all_crawlers(year=args.year, lawd_cd=args.lawd_cd)
    elif args.type == "building":
        df = fetch_building_data(sigungu_cd=args.lawd_cd)
        if not df.empty:
            save_to_csv(df, f"building_register_{args.year}")
    else:
        df = fetch_real_estate_data(args.type, lawd_cd=args.lawd_cd, deal_ymd=f"{args.year}01")
        if not df.empty:
            save_to_csv(df, f"real_estate_{args.type}_{args.year}")

    logger.info("크롤링 완료")


if __name__ == "__main__":
    main()
