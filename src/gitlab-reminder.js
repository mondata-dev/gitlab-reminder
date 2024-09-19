const Gitlab = require('@gitbeaker/node').Gitlab; // All Resources
const { IncomingWebhook } = require('@slack/webhook');

const gitlab = new Gitlab({
    host: process.env.GITLAB_HOST,
    token: process.env.GITLAB_TOKEN,
});

const slackWebhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

async function isUnanswered(issue) {
    const notes = await gitlab.IssueNotes.all(process.env.GITLAB_PROJECT_ID, issue.iid);

    const lastAnswer = notes.filter(note =>
        !note.system &&
            (!note.confidential ||
                note.body.includes('/ deactive gitlab reminder') ||
                note.body.includes('/ deactivate gitlab reminder')
            )
    )[0];

    return !lastAnswer || lastAnswer.author.username === "support-bot";
}

async function main() {
    let issues;
    try {
        issues = await gitlab.Issues.all({
            projectId: process.env.GITLAB_PROJECT_ID,
            state: "opened"
        });
    } catch (e) {
        console.error("Error fetching issues; notifying slack about it...");
        await slackWebhook.send({ text: `There was an error fetching the gitlab issues: ${e.message}` });
        throw e;
    }

    console.log(`Checking ${issues.length} open issues`);

    const unansweredIssues = [];
    for (const issue of issues) {
        // console.log(issue);
        if (await isUnanswered(issue)) {
            unansweredIssues.push(issue);
        }
    }

    console.log(`Found ${unansweredIssues.length} unanswered issues`);

    if (unansweredIssues.length > 0) {
        let msg = `There are ${unansweredIssues.length} unanswered service desk tickets:\n`;
        msg += unansweredIssues.map(issue => `- ${issue.title} by ${issue.service_desk_reply_to} (${issue.web_url})`).join('\n');

        await slackWebhook.send({ text: msg });

        console.log('Successfully sent message to Slack');
    }
}

main().catch(e => {
    console.log(e);
    throw e;
});
