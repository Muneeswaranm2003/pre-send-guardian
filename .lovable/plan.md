# Daily-use features for SpamGuard

Goal: give marketers a reason to open SpamGuard every day, and a short routine they can finish in about 5 minutes.

## 1. "Today" page (new home after sign-in)
- One checklist for the day: log each warmup plan's sends, run today's blacklist check, review any open alerts, run an AI Review on the email going out today.
- Each item links to where it gets done and is ticked off automatically once it's done.
- A streak counter ("5 days in a row") and a daily health score made from authentication, blacklist status, warmup bounce rates and alerts.

## 2. Automatic daily checks
- DNS (SPF/DKIM/DMARC) and blacklist checks run every morning on every monitored domain.
- Results are saved, so a change (for example, a new blacklisting) shows up as an alert on the Today page.

## 3. Warmup daily improvements
- A "Today's target" box on each plan with a one-click "Log as planned" button.
- A reminder banner when today's log hasn't been entered.
- AI Review results are saved per plan, so the day-by-day risk list stays visible without running it again.

## 4. Email templates library
- Save subject and text once, then reuse them in AI Review, the Simulator and the warmup review.
- Shows each template's last risk score and the date it was checked.

## 5. History and trends
- A 30-day chart of the daily health score, blacklist status and bounce rate per domain.
- A weekly summary card: what improved, what got worse, and the top 3 fixes.

## 6. Notifications (on hold)
- A daily email digest and instant alerts. This needs your sender email domain to be set up first; until then, alerts only appear inside the app.

## Order
1. Today page, then 2. automatic checks, then 3. warmup improvements, then 4. templates, then 5. trends. Number 6 waits until the email domain is set up.

## Technical details
- New tables (each with row-level security limited to the owner, and grants for signed-in users and the service role): `daily_checklist`, `domain_check_history`, `email_templates`, `warmup_ai_reviews`.
- A scheduled backend function (pg_cron) runs daily and reuses the verify-dns and check-blacklist logic, writing to `domain_check_history` and `monitoring_alerts`.
- New `/today` route, which becomes where signed-in users land. Existing pages get a "Use template" picker.
- AI calls keep using the existing analyze-deliverability and analyze-warmup functions.
