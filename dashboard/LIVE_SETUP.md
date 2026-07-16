# Live Dashboard Setup

`app.py` is a Streamlit version of the Client Pulse dashboard that reads
directly from the same Google Sheet the n8n automation writes to — no
manual CSV export/import. It auto-refreshes so new automation output
appears without reloading the page.

## 1. Publish your Google Sheet as CSV

1. Open your `feedback-log` Google Sheet
2. **File → Share → Publish to web**
3. Under "Link," select the specific sheet/tab (e.g. `Sheet1`), not "Entire document"
4. Under format, choose **Comma-separated values (.csv)**
5. Click **Publish**, confirm, then copy the generated URL

This URL is read-only and only exposes the published tab — it does not
give anyone edit access to your sheet.

## 2. Connect it to the dashboard

Open `app.py` and replace the placeholder at the top:

```python
SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/YOUR_PUBLISHED_ID/pub?output=csv"
```

with the URL you just copied.

## 3. Install dependencies

```bash
pip install -r requirements.txt --break-system-packages
```

(Drop `--break-system-packages` if you're using a virtual environment,
which is recommended for larger projects.)

## 4. Run it

```bash
streamlit run app.py
```

This opens the dashboard in your browser at `http://localhost:8501`,
reading live data on load and automatically refreshing every 60 seconds
(configurable via `REFRESH_SECONDS` in `app.py`) to pick up new rows as
the n8n workflow adds them.

## What it handles automatically

- **New rows appear without a manual refresh** — the poll interval picks up sheet changes
- **Unclassified rows** (e.g. if the AI classification step got rate-limited) are detected and excluded from the charts, with a visible notice rather than silently breaking
- **Empty state** — if no classified feedback exists yet, the dashboard says so instead of showing broken charts

## Notes for the portfolio writeup

This version demonstrates a materially different skill set than the
React/Recharts Artifact version: live external data ingestion, caching
with TTL, and a polling refresh loop — closer to what an internal
company tool would actually need versus a one-off static view.
