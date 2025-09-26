import json
import logging

from app.api.endpoints.fetch_csv_exmeidai import run_fetch_all_exmeidai


def main():
    logging.basicConfig(level=logging.INFO)
    result = run_fetch_all_exmeidai()
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()


