import createHiveProfilePopup from '../HiveProfilePopup';
import { displayScore } from '../newDesign/utils';
import escapeHTML from 'escape-html';

const TWEET_AUTHOR_SCORE_CLASS = 'HiveExtension-Twitter_tweet-author-score';
const TWEETS_SELECTOR = '.tweet';

export class TwitterTweetsAuthorScoreExtension {
    api;
    settings;

    constructor(api, settings) {
        this.api = api;
        this.settings = settings;
    }

    async start() {
        this.addScoreBelowProfilePicture();
    }

    async addScoreBelowProfilePicture() {
        document.querySelectorAll(TWEETS_SELECTOR).forEach(async tweet => {
            const processedClassName = `${TWEET_AUTHOR_SCORE_CLASS}-processed`;

            if (tweet.classList.contains(processedClassName)) {
                return;
            }

            tweet.classList.add(processedClassName);

            const authorId = tweet.getAttribute('data-user-id');
            if (!this.api.isIdentifierIndexed(authorId)) return;

            const tweetId = tweet.getAttribute('data-item-id');

            if (!authorId) {
                return;
            }

            const userData = await this.api.getFilteredTwitterUserData(authorId);
            if (!userData) return;

            const { clusterName, score, rank } = userData;

            const tweetIsThread =
                Boolean(tweet.querySelector('.self-thread-tweet-cta')) ||
                tweet.classList.contains('conversation-tweet') ||
                (tweet.parentElement && tweet.parentElement.classList.contains('conversation-first-visible-tweet')) ||
                (tweet.parentElement.parentElement &&
                    tweet.parentElement.parentElement.classList.contains('ThreadedConversation-tweet'));

            let threadClass = '';

            if (tweetIsThread) {
                threadClass = TWEET_AUTHOR_SCORE_CLASS + '_display-in-thread';
                if (this.settings.isDarkTheme) {
                    threadClass += '-dark';
                }
            }

            let value = '';
            let tooltip = '';

            if (rank && this.settings.shouldDisplayRank) {
                value = `#${rank}`;
                tooltip = `${clusterName} Rank ${rank}`;
            } else if (this.settings.shouldDisplayScore) {
                value = displayScore(score);
                tooltip = `${clusterName} Score ${value}`;
                value = `[ ${value} ]`;
            } else if (this.settings.shouldDisplayIcon) {
                // TODO: show icon
            }

            const userScoreDisplay = document.createElement('div');
            userScoreDisplay.classList.add(TWEET_AUTHOR_SCORE_CLASS);

            userScoreDisplay.innerHTML = `
            <b class="${TWEET_AUTHOR_SCORE_CLASS}_display ${threadClass} js-tooltip" data-original-title="${escapeHTML(
                tooltip,
            )}">
            <span class="${TWEET_AUTHOR_SCORE_CLASS}_text">${escapeHTML(value)}</span>
            </b>
            `;

            const POPUP_ID = `HiveExtension_Twitter_Popup_Tweet_${tweetId}`;
            const popupStyles = { zIndex: 30 };
            await createHiveProfilePopup(
                this.settings,
                userData,
                userScoreDisplay,
                userScoreDisplay,
                POPUP_ID,
                popupStyles,
            );

            const accountGroup = tweet.querySelector('.stream-item-header');

            if (accountGroup) {
                accountGroup.appendChild(userScoreDisplay);
            }
        });
    }
}
