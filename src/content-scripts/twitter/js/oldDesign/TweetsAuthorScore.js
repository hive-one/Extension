import createHiveProfilePopup from '../HiveProfilePopup';
import { displayScore } from '../newDesign/utils';
import escapeHTML from 'escape-html';

const TWEET_AUTHOR_SCORE_CLASS = 'HiveExtension-Twitter_tweet-author-score';
const TWEETS_SELECTOR = '.tweet';

const BEE_ICON = `
    <svg style='height: 17px' viewBox="0 0 36 36">
        <use xlink:href="#hive-icon" />
    </svg>
`;

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

            const authorScreenName = tweet.getAttribute('data-screen-name');
            if (!this.api.isIdentifierIndexed(authorScreenName)) return;

            const tweetId = tweet.getAttribute('data-item-id');

            if (!authorScreenName) {
                return;
            }

            const userData = await this.api.getFilteredTwitterUserData(authorScreenName);
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
            let icon = '';

            if (rank && this.settings.shouldDisplayRank) {
                value = `#${rank}`;
                tooltip = `${clusterName} Rank ${rank}`;
            } else if (this.settings.shouldDisplayScore) {
                value = displayScore(score);
                tooltip = `${clusterName} Score ${value}`;
                value = `[ ${value} ]`;
            } else if (this.settings.shouldDisplayIcon) {
                icon = BEE_ICON;
            }

            const userScoreDisplay = document.createElement('div');
            userScoreDisplay.classList.add(TWEET_AUTHOR_SCORE_CLASS);

            userScoreDisplay.innerHTML = `
            <b class="${TWEET_AUTHOR_SCORE_CLASS}_display ${threadClass} js-tooltip" data-original-title="${escapeHTML(
                tooltip,
            )}">
                <span class="${TWEET_AUTHOR_SCORE_CLASS}_text">${escapeHTML(value)}</span>
                <span>${icon}</span>
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
