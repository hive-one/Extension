import { waitUntilResult, getTweets, depthFirstNodeSearch } from './utils';
import createProfilePopup from './ProfilePopup';
import { TOOLTIPS } from '../../../../config';

const TWEET_AUTHOR_SCORE_CLASS = 'HiveExtension_Twitter_TweetAuthor';

const createTweetScoreIcon = ({ text = '', tooltipText = '' }) => `
<div class="${TWEET_AUTHOR_SCORE_CLASS} ${TOOLTIPS.TOOLTIP_CLASS}">
    <span class="${TWEET_AUTHOR_SCORE_CLASS}-text">${text}</span>
    <span class="${TOOLTIPS.TOOLTIP_TEXT_CLASS}">${tooltipText}</span>
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

            await this.addAuthorScoreToTweet(tweetNode, tweetAuthorScreenName, TWEET_AUTHOR_SCORE_ID, tweetId);
        }
    }

    async addAuthorScoreToTweet(tweetNode, tweetAuthorScreenName, elementId, tweetId) {
        const userData = await this.api.getFilteredTwitterUserData(tweetAuthorScreenName);
        if (!userData) {
            throw new Error(`Failed getting user data for tweet author @${tweetAuthorScreenName}`);
        }

        const { rank, clusterName } = userData;

        const userScoreDisplay = document.createElement('div');
        userScoreDisplay.id = elementId;
        userScoreDisplay.classList.add(`${TWEET_AUTHOR_SCORE_CLASS}-container`);

        userScoreDisplay.innerHTML = createTweetScoreIcon({ text: rank, tooltipText: `${clusterName} Rank` });

        const authorImageAnchor = this.getAuthorImageAnchor(tweetNode, tweetAuthorScreenName);
        const authorImageColumn = authorImageAnchor.parentNode.parentNode.parentNode;

        const POPUP_ID = `HiveExtension-Twitter_TweetAuthor_Popup_${tweetId}`;

        // Create popup styles
        // Twitters new design contains numerous instances of z-index: 0 not
        // only on every tweet, but several children nodes within the tweet.
        // This constant creation of new stacking contexts requires ugly hacky
        // solutions to display our popup.

        const tweetRect = tweetNode.getBoundingClientRect();
        const authorImageRect = authorImageAnchor.getBoundingClientRect();

        const left = tweetRect.left + 'px';
        const top = authorImageRect.top + window.pageYOffset + 80 + 'px';
        const popupStyles = { top, left };

        await createProfilePopup(this.settings, userData, userScoreDisplay, document.body, POPUP_ID, popupStyles);

        if (document.getElementById(elementId)) return;
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
