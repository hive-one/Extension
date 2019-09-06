import { ProfilePopup } from './ProfilePopup';
import escapeHTML from 'escape-html';

const TWEET_AUTHOR_SCORE_CLASS = 'HiveExtension-Twitter_tweet-author-score';
const TWEET_INDIVIDUAL_SCORE_CLASS = 'HiveExtension-Twitter_tweet-individual-score';
const TWEETS_SELECTOR = '.tweet';

export class TwitterTweetsAuthorScoreExtension {
    _api;
    _settings;

    constructor(api, settings) {
        this._api = api;
        this._settings = settings;
    }

    async start() {
        this.addScoreBelowProfilePicture();
    }

    async addScoreToTweetFooter() {
        document.querySelectorAll(TWEETS_SELECTOR).forEach(async tweet => {
            const processedClassName = `${TWEET_INDIVIDUAL_SCORE_CLASS}-processed`;

            if (!tweet || tweet.classList.contains(processedClassName)) {
                return;
            }

            tweet.classList.add(processedClassName);

            const authorId = tweet.getAttribute('data-user-id');

            const { name: clusterName, score: userScore } = await this._api.getTwitterUserData(authorId);

            const userScoreDisplay = document.createElement('div');
            userScoreDisplay.classList.add(TWEET_INDIVIDUAL_SCORE_CLASS);
            userScoreDisplay.classList.add('ProfileTweet-action');
            userScoreDisplay.innerHTML = `<button class="${TWEET_INDIVIDUAL_SCORE_CLASS}_display ProfileTweet-actionButton js-tooltip" data-original-title="${escapeHTML(
                clusterName,
            )} Score">

      <div class="IconContainer">
          <span class="Icon Icon--medium">
            <svg viewBox="0 0 36 36" class="${TWEET_INDIVIDUAL_SCORE_CLASS}_display_icon">
              <use xlink:href="#hive-icon" />
            </svg>
          </span>
        </div>

      <span class="ProfileTweet-actionCount">
        <span class="${TWEET_INDIVIDUAL_SCORE_CLASS}_display_score">${Math.round(userScore)}</span>
      </span>

      </button>
      `;

            const popup = new ProfilePopup(authorId, this._api, this._settings);
            popup.showOnClick(userScoreDisplay);

            const actionList = tweet.querySelector('.ProfileTweet-actionList');

            if (actionList) {
                actionList.appendChild(userScoreDisplay);
            }
        });
    }

    async addScoreBelowProfilePicture() {
        document.querySelectorAll(TWEETS_SELECTOR).forEach(async tweet => {
            const processedClassName = `${TWEET_AUTHOR_SCORE_CLASS}-processed`;

            if (tweet.classList.contains(processedClassName)) {
                return;
            }

            tweet.classList.add(processedClassName);

            const authorId = tweet.getAttribute('data-user-id');

            if (!authorId) {
                return;
            }

            const {
                name: defaultClusterName,
                score: userScore,
                rank: defaultClusterRank,
                indexed: accountIndexed,
            } = await this._api.getTwitterUserData(authorId);

            if (!accountIndexed) {
                return;
            }

            const tweetIsThread =
                Boolean(tweet.querySelector('.self-thread-tweet-cta')) ||
                tweet.classList.contains('conversation-tweet') ||
                (tweet.parentElement && tweet.parentElement.classList.contains('conversation-first-visible-tweet')) ||
                (tweet.parentElement.parentElement &&
                    tweet.parentElement.parentElement.classList.contains('ThreadedConversation-tweet'));

            let threadClass = TWEET_AUTHOR_SCORE_CLASS + '_display-in-thread';

            if (this._settings.isDarkTheme) {
                threadClass += '-dark';
            }

            const option = await this._settings.getOptionValue('displaySetting');
            const useIcons = await this._settings.getOptionValue('useIcons');

            let value = '';
            let tooltip = '';

            if (['showRanksWithScoreFallback', 'showRanks'].includes(option) && defaultClusterRank) {
                value = defaultClusterRank;

                if (!useIcons) {
                    value = `#${value}`;
                }

                tooltip = `${defaultClusterName} Rank ${defaultClusterRank}`;
            } else if (option !== 'showRanks') {
                value = Math.round(userScore);

                if (!useIcons) {
                    value = `[ ${value} ]`;
                }

                tooltip = `${defaultClusterName} Score ${value}`;
            }

            if (!value || !tooltip) {
                return;
            }

            const userScoreDisplay = document.createElement('div');
            userScoreDisplay.classList.add(TWEET_AUTHOR_SCORE_CLASS);

            if (useIcons) {
                userScoreDisplay.classList.add(`${TWEET_AUTHOR_SCORE_CLASS}-icons`);
            }

            userScoreDisplay.innerHTML = `
        <b class="${TWEET_AUTHOR_SCORE_CLASS}_display ${
                tweetIsThread ? threadClass : ''
            } js-tooltip" data-original-title="${escapeHTML(tooltip)}">
          <svg viewBox="0 0 36 36" class="${TWEET_AUTHOR_SCORE_CLASS}_icon">
            <use xlink:href="#hive-icon-small" />
          </svg>
          <span class="${TWEET_AUTHOR_SCORE_CLASS}_text">${escapeHTML(value)}</span>
        </b>`;

            if (accountIndexed) {
                const popup = new ProfilePopup(authorId, this._api, this._settings);
                popup.showOnClick(userScoreDisplay);
            }

            const accountGroup = tweet.querySelector('.stream-item-header');

            if (accountGroup) {
                accountGroup.appendChild(userScoreDisplay);
            }
        });
    }
}
