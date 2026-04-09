# ─────────────────────────────────────────────────────────────────
# METRIC:    Deployment Frequency
# MEASURES:  How often the team deploys to production
# ELITE:     Multiple times per day
# QA ROLE:   Ensure the test suite is fast enough not to
#            block the deploy pipeline
# ─────────────────────────────────────────────────────────────────
echo '=== Deployment Frequency (last 30 days) ==='
git log --oneline --since='30 days ago' --grep='chore: release' | wc -l

# ─────────────────────────────────────────────────────────────────
# METRIC:    Lead Time for Changes
# MEASURES:  Time from commit to production deploy
# ELITE:     Less than 1 hour
# QA ROLE:   Identify where tests add unnecessary latency
#            to the pipeline
# ─────────────────────────────────────────────────────────────────
echo '=== Lead Time — commits since last release ==='
git log $(git describe --tags --abbrev=0)..HEAD --oneline | wc -l

# ─────────────────────────────────────────────────────────────────
# METRIC:    Change Failure Rate
# MEASURES:  % of deploys that cause a production incident
# ELITE:     Less than 5%
# QA ROLE:   Measure escape rate — bugs that passed through
#            testing and reached production
# ─────────────────────────────────────────────────────────────────
echo '=== Change Failure Rate: calculate in Jira/Linear ==='
echo 'Formula: (production bugs / total deploys) x 100'

# Manual calculation example
BUGS_PROD=3
TOTAL_DEPLOYS=40
echo "CFR = $(echo 'scale=1; '$BUGS_PROD'/'$TOTAL_DEPLOYS'*100' | bc)%"

# ─────────────────────────────────────────────────────────────────
# METRIC:    Time to Restore (MTTR)
# MEASURES:  Average time to recover from a failure
# ELITE:     Less than 1 hour
# QA ROLE:   Ensure smoke tests in production detect failures
#            quickly after each deploy
# NOTE:      Cannot be measured via Git — requires data from
#            your incident management tool (PagerDuty, Opsgenie)
#            Formula: avg(incident_resolved - incident_opened)
# ─────────────────────────────────────────────────────────────────

echo '=== Time to Restore (MTTR): calculate in your incident tracker ==='
echo 'Formula: avg(incident_resolved_at - incident_opened_at)'

