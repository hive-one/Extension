import { waitUntilResult, getTweets, depthFirstNodeSearch } from './utils';
const TWEET_AUTHOR_SCORE_CLASS = 'HiveExtension-Twitter_tweet-author-score';

const createTweetScoreIcon = value => `
<div class="HiveExtension-Twitter_tweet-author-score_container">
    <span class="${TWEET_AUTHOR_SCORE_CLASS}_text">${value}</span>
</div>
`;

export default class {
    settings;
    api;
    constructor(_settings, _api) {
        this.settings = _settings;
        this.api = _api;
    }

    async run() {
        const tweets = await waitUntilResult(getTweets);
        if (!tweets || !tweets.length) {
            throw new Error(`Failed finding tweets for @${this.screenName}`);
        }

        const r = /\/([A-Za-z0-9_]+)\/status\/([0-9]+)/;
        for (let i = 0; i < tweets.length; i++) {
            const tweetNode = tweets[i];
            const match = r.exec(tweetNode.innerHTML);
            if (!match) {
                throw new Error(`Founded unrecognisable <article> ${tweetNode.outerHTML}`);
            }
            const tweetAuthorScreenName = match[1];
            const tweetId = match[2];

            // Skip tweets from users who aren't within our available ids
            if (!this.api.isIdentifierIndexed(tweetAuthorScreenName)) continue;
            const TWEET_AUTHOR_SCORE_ID = `HiveExtension-Twitter_tweet-author-score_${tweetId}`;
            if (document.getElementById(TWEET_AUTHOR_SCORE_ID)) continue;

            await this.addAuthorScoreToTweet(tweetNode, tweetAuthorScreenName, TWEET_AUTHOR_SCORE_ID);
        }
    }

    async addAuthorScoreToTweet(tweetNode, tweetAuthorScreenName, elementId) {
        const userData = await this.api.getFilteredTwitterUserData(tweetAuthorScreenName);
        if (!userData) {
            throw new Error(`Failed getting user data for tweet author @${tweetAuthorScreenName}`);
        }

        const { rank } = userData;

        const userScoreDisplay = document.createElement('div');
        userScoreDisplay.id = elementId;
        userScoreDisplay.classList.add(`${TWEET_AUTHOR_SCORE_CLASS}-container`);

        userScoreDisplay.innerHTML = createTweetScoreIcon(`#${rank}`);

        const authorImageAnchor = this.getAuthorImageAnchor(tweetNode, tweetAuthorScreenName);
        const authorImageColumn = authorImageAnchor.parentNode.parentNode.parentNode;
        authorImageColumn.appendChild(userScoreDisplay);
    }

    getAuthorImageAnchor(tweetNode, screenName) {
        // crawls the children nodes of the tweet for the anchor tag that
        // wraps the tweet authors profile image
        const HREF = `https://twitter.com/${screenName}`;
        const testCondition = node => node.tagName === 'A' && node.href === HREF;
        const authorImageAnchor = depthFirstNodeSearch(tweetNode, testCondition);
        if (!authorImageAnchor) {
            throw new Error(`Failed finding tweet authors image tag: @${screenName}`);
        }

        return authorImageAnchor;
    }
}
