"""
Vantage Point Consulting — Client Pulse (live dashboard)

Reads feedback data directly from the same Google Sheet the n8n
automation writes to, so the dashboard always reflects the latest
classified feedback with no manual export/import step.

Run with:
    streamlit run app.py
"""

import html
import time

import altair as alt
import pandas as pd
import streamlit as st

# ---- CONFIG -----------------------------------------------------------
# Paste your published Google Sheet CSV URL here. To get it:
#   File -> Share -> Publish to web -> select the feedback-log tab ->
#   Comma-separated values (.csv) -> Publish -> copy the URL.
SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR82eT4sCV5D8D5RdXmIu4jLZYiFDEywoc3-EPXL-3lExdWeUqEI6gUfuQC_1iu4Za6la9LMlqxwjaW/pub?gid=141934533&single=true&output=csv"

REFRESH_SECONDS = 60  # how often the dashboard checks for new data

st.set_page_config(page_title="Client Pulse — Vantage Point", layout="wide")

# ---- STYLE --------------------------------------------------------------
PAPER, INK, MUTED, BORDER = "#F7F6F2", "#1B1D1F", "#6E6B62", "#E3E0D6"
TEAL, RED, AMBER = "#0F5E56", "#B23A2E", "#B4790C"
SENT_COLOR = {"positive": TEAL, "negative": RED, "neutral": AMBER}

st.markdown(
    f"""
    <style>
    .stApp, .main, .block-container {{ background-color: {PAPER}; color: {INK}; }}
    .block-container {{ padding-top: 2rem; max-width: 980px; }}
    .stMarkdown h1, .stMarkdown h2, .stMarkdown h3, .stMarkdown h4, .stMarkdown h5, .stMarkdown h6 {{
        color: {INK} !important;
    }}
    [data-testid="stMetricValue"] {{ font-size: 26px; color: {INK}; }}
    [data-testid="stMetricLabel"] {{ color: {MUTED}; }}
    .stAlert, .stInfo, .stWarning, .stSuccess, .stError {{ color: {INK}; }}
    </style>
    """,
    unsafe_allow_html=True,
)


# ---- DATA LOADING -------------------------------------------------------
@st.cache_data(ttl=REFRESH_SECONDS)
def load_data(url: str) -> pd.DataFrame:
    df = pd.read_csv(url)
    df.columns = [c.strip().lower() for c in df.columns]
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df["sentiment"] = df["sentiment"].astype(str).str.strip().str.lower()
    df["topic"] = df["topic"].astype(str).str.strip().str.lower()
    return df


def is_using_placeholder(url: str) -> bool:
    return "YOUR_PUBLISHED_ID" in url


# ---- HEADER ---------------------------------------------------------------
left, right = st.columns([3, 1])
with left:
    st.caption("VANTAGE POINT CONSULTING")
    st.markdown("## Client Pulse")
with right:
    st.caption("Live feed")
    st.markdown(f"Auto-refreshes every {REFRESH_SECONDS}s")

st.divider()

if is_using_placeholder(SHEET_CSV_URL):
    st.warning(
        "This dashboard isn't connected to a live sheet yet. "
        "Publish your `feedback-log` Google Sheet to the web as CSV "
        "(File → Share → Publish to web → CSV), then paste that URL "
        "into `SHEET_CSV_URL` at the top of `app.py`."
    )
    st.stop()

try:
    raw = load_data(SHEET_CSV_URL)
except Exception as e:
    st.error(f"Couldn't load the sheet. Check that it's published and the URL is correct.\n\n{e}")
    st.stop()

# Split classified vs. not-yet-classified rows (e.g. rate-limited by the AI step)
classified = raw[raw["sentiment"].isin(["positive", "negative", "neutral"])].copy()
pending = raw[~raw["sentiment"].isin(["positive", "negative", "neutral"])]

if pending.shape[0] > 0:
    st.info(f"{pending.shape[0]} row(s) haven't been classified yet by the automation workflow — excluded from the charts below.")

if classified.empty:
    st.warning("No classified feedback yet. Once the n8n workflow runs, results will appear here automatically.")
    st.stop()

# ---- KPI ROW ------------------------------------------------------------
total = len(classified)
neg = (classified["sentiment"] == "negative").sum()
pos = (classified["sentiment"] == "positive").sum()
top_topic = classified["topic"].value_counts().idxmax()

k1, k2, k3, k4 = st.columns(4)
k1.metric("Feedback logged", total)
k2.metric("Negative rate", f"{round(neg / total * 100)}%", delta=f"{neg} entries", delta_color="inverse")
k3.metric("Positive rate", f"{round(pos / total * 100)}%", delta=f"{pos} entries")
k4.metric("Top topic", top_topic.capitalize())

st.divider()

# ---- PULSE TIMELINE -------------------------------------------------------
st.markdown("#### Feedback timeline, by sentiment")

pulse = classified.sort_values("timestamp").copy()
pulse["y"] = 0

pulse_chart = (
    alt.Chart(pulse)
    .mark_circle(size=140, opacity=0.9)
    .encode(
        x=alt.X("timestamp:T", title=None, axis=alt.Axis(format="%b %d", grid=False)),
        y=alt.Y("y:Q", axis=None, scale=alt.Scale(domain=[-1, 1])),
        color=alt.Color(
            "sentiment:N",
            scale=alt.Scale(domain=list(SENT_COLOR.keys()), range=list(SENT_COLOR.values())),
            legend=alt.Legend(title=None, orient="top"),
        ),
        tooltip=["customer", "topic", "sentiment", alt.Tooltip("timestamp:T", format="%b %d, %Y")],
    )
    .properties(height=140)
    .configure_view(strokeWidth=0)
)
st.altair_chart(pulse_chart, width="stretch")

st.divider()

# ---- TOPIC BREAKDOWN ----------------------------------------------------
st.markdown("#### Mentions by topic")

topic_counts = classified["topic"].value_counts().reset_index()
topic_counts.columns = ["topic", "count"]

topic_chart = (
    alt.Chart(topic_counts)
    .mark_bar(color=TEAL, cornerRadiusTopRight=4, cornerRadiusBottomRight=4)
    .encode(
        x=alt.X("count:Q", title=None, axis=alt.Axis(grid=True, tickMinStep=1)),
        y=alt.Y("topic:N", sort="-x", title=None),
        tooltip=["topic", "count"],
    )
    .properties(height=32 * len(topic_counts) + 20)
)
st.altair_chart(topic_chart, width="stretch")

st.divider()

# ---- FLAGGED ACCOUNTS ------------------------------------------------------
st.markdown("#### Accounts flagged for follow-up")
st.caption("Negative sentiment, routed to Customer Success automatically")

flagged = classified[classified["sentiment"] == "negative"].sort_values("timestamp", ascending=False)

if flagged.empty:
    st.success("No negative feedback in the current window.")
else:
    for _, row in flagged.iterrows():
        customer_name = html.escape(str(row["customer"]))
        feedback_text = html.escape(str(row["feedback_text"]))
        topic_tag = html.escape(str(row["topic"]))
        timestamp_text = row["timestamp"].strftime("%b %d, %Y") if pd.notna(row["timestamp"]) else ""
        st.markdown(
            f"""
            <div style="background:#F4DEDB; border-radius:16px; padding:18px; margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap;">
                <strong style="color:{INK}; font-size:16px;">{customer_name}</strong>
                <span style="color:{MUTED}; font-size:12px;">{timestamp_text}</span>
              </div>
              <p style="color:{INK}; margin:12px 0 10px 0; line-height:1.5;">{feedback_text}</p>
              <span style="background:{RED}; color:white; padding:6px 14px; border-radius:20px; font-size:12px;">
                {topic_tag}
              </span>
            </div>
            """,
            unsafe_allow_html=True,
        )

st.caption("Generated from the automated feedback triage workflow · AI Ops Assistant project")

# ---- AUTO-REFRESH ---------------------------------------------------------
# Simple polling refresh: reruns the script on an interval so new sheet
# rows (and new automation output) appear without a manual reload.
time.sleep(REFRESH_SECONDS)
st.rerun()
