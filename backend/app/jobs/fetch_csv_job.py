import json
import logging

from app.api.endpoints.fetch_csv import run_fetch_csv


def main():
    logging.basicConfig(level=logging.INFO)
    result = run_fetch_csv()
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()


