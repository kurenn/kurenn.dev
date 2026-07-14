#!/usr/bin/env python3
"""Build the lead-magnet PDF from the print source.

    python3 _internal/guide/render.py

Fills index.html's placeholders with the 50 items and the site's real @font-face
rules (lifted from the live page, so the guide and the site are set in the same
metal), then prints it to PDF through Chrome.

Every item is (job, what the agent does, THE RECEIPT). The receipt is not
decoration — it is the entire point. An automation you can't check isn't an
automation, it's a rumour. If you add an item and can't write its receipt line,
the item doesn't belong in the guide.
"""

import pathlib
import re
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "guide" / "50-things-you-could-be-automating.pdf"

# ---------------------------------------------------------------------------
# The 50. (job, does, receipt)
# ---------------------------------------------------------------------------

SALES = [
    ("Turn every sales call into a CRM update",
     "It listens to the recording, writes the summary, updates the deal stage, and lists what you promised the customer.",
     "The deal record changed today. If you had a call and nothing moved, that's a bug — not a quiet day."),
    ("Draft the follow-up while the call is still warm",
     "Within ten minutes of hanging up, a draft is sitting in your inbox with what you agreed and the next date. You edit and send.",
     "A draft exists before you've made coffee. No draft = no call happened, or the agent is down."),
    ("Tell you which deals have gone quiet",
     "It watches for the deals where nobody has spoken in fourteen days and puts them in front of you, oldest first.",
     "A weekly list with names on it. An empty list on a week you know is messy means it isn't looking."),
    ("Prep you before the intro call",
     "Fifteen minutes before the meeting: who they are, what they raised, what they shipped last month, and the three questions worth asking.",
     "A one-pager in your inbox with a timestamp before the meeting starts. Late = useless."),
    ("Keep the pipeline honest",
     "It sweeps for deals rotting in a stage nobody has touched, and asks the owner one question: is this real?",
     "The stale count, posted every Monday. If it's ever zero, be suspicious — pipelines are never that clean."),
    ("Answer the security questionnaire",
     "It fills the 200-row spreadsheet from your previous answers and flags only the rows it genuinely doesn't know.",
     "The count of rows it left blank. A confident 0-blanks answer is the one to distrust — go read it."),
    ("Write the pipeline note for your board",
     "It turns the CRM into three paragraphs a human investor would actually read, with the numbers attached.",
     "It's in your drafts before the board email is due, with every number traceable back to a deal."),
]

MARKETING = [
    ("Turn one long thing into ten short things",
     "A talk, a doc, a customer call — cut into posts, each one able to stand alone.",
     "Ten drafts land in a folder. You approve or kill each one. Nothing publishes without a click."),
    ("Write from what you actually shipped",
     "It reads the week's changelog and drafts the customer-facing note: what changed, why you'd care.",
     "A draft per release. If you shipped and there's no draft, the pipe is broken."),
    ("Keep the swipe file",
     "Everything that performed well — yours and other people's — captured with a line on why it worked.",
     "The file grows every week. A file that stopped growing is a dead agent."),
    ("Find the conversations worth joining",
     "It surfaces the threads where someone is asking, right now, the exact question your product answers.",
     "A short list, daily, with links. You reply as yourself. The agent never replies."),
    ("Refresh the page that's gone stale",
     "It flags copy that promises things you no longer do, or misses things you now do.",
     "A diff you can read in a minute. Approve, edit, or ignore."),
    ("Turn real customer questions into content briefs",
     "It reads support tickets, clusters the repeated questions, and hands you the ten pieces worth writing.",
     "Each brief cites the tickets it came from. A brief with no tickets under it is invented — bin it."),
    ("Send the 'what shipped' digest",
     "Monthly, to customers, in your voice — every item linked to the thing itself.",
     "It goes to your drafts, not to the customers. You press send. Always you."),
]

SUPPORT = [
    ("Triage by what people mean, not what they typed",
     "Bug, billing, feature request, angry — sorted before anyone opens the inbox.",
     "Every ticket carries a label and a confidence. Low-confidence ones go to a human queue, visibly."),
    ("Draft the answer, with the doc link attached",
     "The reply is written and the relevant doc is found. A human reads it and hits send.",
     "Time-to-first-draft. If a ticket sits with no draft, the agent didn't see it."),
    ("Turn the question you keep answering into a doc",
     "The fifth time the same question arrives, it writes the doc and tells you.",
     "A new doc appears, citing the five tickets. That count is the whole justification."),
    ("Spot the customer who's about to leave",
     "Logins fall off a cliff, usage halves, the champion goes quiet — you hear about it this week, not at renewal.",
     "An alert with the specific numbers that moved. No numbers, no alert — hunches don't count."),
    ("Nudge the customer who never finished setup",
     "It notices who signed up and never did the one thing that makes the product work, and drafts a human nudge.",
     "The list of who was nudged, and who converted after. If nobody converts, kill it — it's spam."),
    ("Turn a vague bug report into something reproducible",
     "\"It's broken\" becomes steps, environment, and the log line that matters.",
     "The issue it files either reproduces or it doesn't. That's a hard, honest scoreboard."),
    ("Write the refund decision memo",
     "It assembles the account history, the policy, and a recommendation. A human decides.",
     "A memo per request. The decision line is blank until a person fills it in — by design."),
]

OPS = [
    ("Reconcile the numbers you keep eyeballing",
     "The two spreadsheets that should agree, checked every night, with only the differences shown.",
     "A nightly \"matched\" or \"3 rows differ.\" A night with no message at all means it didn't run — treat that as a failure."),
    ("Chase the invoices nobody wants to chase",
     "Overdue by seven days, it drafts the polite nudge. Overdue by thirty, it drafts the less polite one.",
     "The list of who it chased, posted where you'll see it. Zero chased on a day with overdue invoices is a bug."),
    ("Audit the subscriptions you forgot you had",
     "Every recurring charge, matched against whether anyone logged in this quarter.",
     "A list with a total at the bottom. Most founders find four figures a year on the first run."),
    ("Watch the cloud bill for the shape change",
     "Not the total — the shape. It tells you when something that cost $8 a day starts costing $80.",
     "An alert naming the line item and the day it changed. Totals hide this; line items don't."),
    ("Turn receipts into a ledger",
     "Photograph, forward, or drop it. It's categorised and filed before your accountant asks.",
     "The count filed this month vs. the count on your card statement. Those numbers must match."),
    ("Read the contract first",
     "It flags auto-renewal, liability, exclusivity, and anything unusual — with the clause quoted.",
     "Flags always quote the clause. A flag with no quote is a hallucination, and you'll spot it instantly."),
    ("Collect the compliance evidence continuously",
     "The screenshots and logs your auditor will want, gathered as you go instead of in one miserable week.",
     "The evidence folder has this week's date in it. Stale folder = dead agent."),
    ("Write the Monday numbers email",
     "The five numbers that matter, what changed, and one sentence on why — before you're awake.",
     "It arrives every Monday. A Monday with no email is an incident, not a break."),
]

ENG = [
    ("Review the code before a human does",
     "First pass on every pull request. It only speaks when it can point at a line and say why.",
     "Comments cite file and line. A review with no line numbers is noise — configure it to stay quiet instead."),
    ("Write the test that reproduces the bug",
     "Before anyone fixes anything, there's a failing test that proves the bug is real.",
     "The test fails before the fix and passes after. If it passes before the fix, it's testing nothing."),
    ("Keep dependencies moving",
     "Small upgrades, continuously, with the test suite as the judge — instead of one terrifying upgrade a year.",
     "Green suite, merged. Red suite, it stops and tells you which package broke."),
    ("Draft the postmortem while it's fresh",
     "It assembles the timeline from the alerts, the deploys and the chat, so a human writes the analysis, not the archaeology.",
     "A timeline with timestamps you can check against the logs yourself."),
    ("Catch the slow query before your customers do",
     "The database call that runs 400 times when it should run once, flagged in review.",
     "It names the query and the count. Numbers, not adjectives."),
    ("Keep the docs honest",
     "When the code changes and the README doesn't, it notices and drafts the fix.",
     "The diff between what the docs claim and what the code does. Empty diff = they agree."),
    ("Check the migration won't take the site down",
     "The schema change that locks a table for nine minutes on production data, caught before it ships.",
     "A verdict with the estimated lock time, on a copy of real data volumes — not on your laptop's 40 rows."),
    ("Hunt the flaky test",
     "It runs the suspicious test a hundred times and tells you the failure rate, instead of everyone shrugging and hitting retry.",
     "\"Fails 6 times in 100.\" Now it's a number, and numbers get fixed."),
    ("Build the prototype so the meeting has something to look at",
     "A clickable version of the idea, same day, before anyone commits a quarter to it.",
     "A link that opens. Every button goes somewhere, or it isn't done."),
    ("Audit the codebase you're about to inherit",
     "Before you hire, before you acquire, before you say yes — what's actually in there.",
     "A ranked report where every finding points at a file. Findings without files are vibes."),
    ("Turn the error tracker into a to-do list",
     "Ranked by how many real customers hit it, not by how loud it is.",
     "The rank order and the user counts behind it. You'll disagree with the top item once, and be wrong."),
]

HIRING = [
    ("Screen applications against the actual job",
     "Not keywords — the job. It sorts, explains why, and never rejects anyone by itself.",
     "Every ranking has a written reason you can argue with. If you can't argue with it, it isn't a reason."),
    ("Turn interview notes into a scorecard",
     "Your scribbles, structured against the same criteria for every candidate, so you compare like with like.",
     "A filled scorecard per interview, within the hour. Empty fields stay visibly empty."),
    ("Get the reply out the same day",
     "Offer or rejection, drafted immediately, so nobody waits two weeks to hear no. You send it.",
     "Time from decision to draft. The number that matters — and the one that makes people respect you."),
    ("Build the 30-day plan before they start",
     "Per role: what they read, who they meet, what they ship in week one.",
     "The plan exists before day one. A plan written on day three is a plan that doesn't exist."),
    ("Prep your 1:1s",
     "What they said last time, what they were blocked on, whether it moved.",
     "It shows you last week's blocker and whether it's still there. That one line changes the meeting."),
]

YOU = [
    ("Write the Friday brief you never write",
     "What moved, what didn't, what you said you'd do and didn't do.",
     "It arrives Friday. The \"didn't do\" section is the one worth reading, so it never gets dropped."),
    ("Kill the meeting that should have been a document",
     "It drafts the doc from the agenda. If the doc answers it, cancel the meeting.",
     "Meetings cancelled. Count them. That's hours back, and it's a real number."),
    ("Triage your inbox by 'does this need a founder?'",
     "Most of it doesn't. It surfaces the handful that genuinely need you.",
     "The count it held back, visible daily. If you never disagree with what it filtered, you aren't checking."),
    ("Research the decision before you make it",
     "The memo — options, trade-offs, what it costs — sitting there before the call, not improvised during it.",
     "Every claim in the memo carries a source. A claim without a source is an opinion wearing a suit."),
    ("Watch your other agents",
     "One agent whose only job is to notice when another one has quietly stopped doing anything.",
     "It reports on the ones that produced nothing. Then break it on purpose and confirm it screams. If it doesn't scream, you are back where you started — and you won't know it."),
]

GROUPS = {
    "ITEMS_SALES": (SALES, 1),
    "ITEMS_MARKETING": (MARKETING, 8),
    "ITEMS_SUPPORT": (SUPPORT, 15),
    "ITEMS_OPS": (OPS, 22),
    "ITEMS_ENG": (ENG, 30),
    "ITEMS_HIRING": (HIRING, 41),
    "ITEMS_YOU": (YOU, 46),
}


def item_html(n, job, does, receipt):
    return f"""    <div class="item keep">
      <div class="num">{n:02d}</div>
      <div class="body">
        <div class="job">{job}</div>
        <div class="does">{does}</div>
        <div class="receipt"><b>Receipt</b> &nbsp;{receipt}</div>
      </div>
    </div>"""


def build():
    src = (HERE / "index.html").read_text()

    # Same fonts as the site — lifted from the live page so the guide and the
    # site are set in the same metal. Paths hop up two levels to /fonts.
    site = (ROOT / "index.html").read_text()
    faces = re.findall(r"@font-face\s*\{.*?\}", site, re.S)
    faces = [f.replace("url('fonts/", "url('../../fonts/") for f in faces]
    if len(faces) < 20:
        raise SystemExit(f"only found {len(faces)} @font-face rules — check index.html")
    src = src.replace("FONT_FACES", "\n".join(faces))

    total = 0
    for key, (items, start) in GROUPS.items():
        html = "\n".join(item_html(start + i, *it) for i, it in enumerate(items))
        src = src.replace(key, html)
        total += len(items)

    if total != 50:
        raise SystemExit(f"the '50 things' guide has {total} things in it")

    built = HERE / "built.html"
    built.write_text(src)
    print(f"✓ {total} items · {built}")
    return built


def to_pdf(built):
    OUT.parent.mkdir(parents=True, exist_ok=True)
    script = f"""
import base64, time
new_tab({built.resolve().as_uri()!r})
wait_for_load(); time.sleep(3)
ensure_real_tab()
r = cdp("Page.printToPDF", printBackground=True, preferCSSPageSize=True,
        marginTop=0, marginBottom=0, marginLeft=0, marginRight=0)
open({str(OUT)!r}, "wb").write(base64.b64decode(r["data"]))
print("PDF_OK")
"""
    r = subprocess.run(["browser-harness"], input=script,
                       capture_output=True, text=True, timeout=180)
    out = r.stdout + r.stderr
    if "PDF_OK" not in out:
        raise SystemExit(out.strip()[-1500:])
    print(f"✓ {OUT}  ({OUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    to_pdf(build())
