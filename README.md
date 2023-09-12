# Reminder for unanswered gitlab issues

This tiny script sends a daily reminder via slack if there are unanswered gitlab issues in a gitlab project.

## Environment variables

- `GITLAB_TOKEN`: Gitlab access token (requires `read_api` access to gitlab project)
- `GITLAB_HOST`: Gitlab host url, e.g. `https://gitlab.com`
- `GITLAB_PROJECT_ID`: Gitlab project id, e.g. `123456`
- `SLACK_WEBHOOK_URL`: Slack webhook url, e.g. `https://hooks.slack.com/services/...`