import createHiveProfilePopup from '../HiveProfilePopup';
import { waitUntilResult, getTweets, depthFirstNodeSearch, displayRank, displayScore } from './utils';
import { TOOLTIP_CLASSNAMES } from '../../../../config';

const TWEET_AUTHOR_SCORE_CLASS = 'HiveExtension_Twitter_TweetAuthor';

const createTweetScoreIcon = ({ display = '', tooltipText = '' }) => `
<div class="${TWEET_AUTHOR_SCORE_CLASS} ${TOOLTIP_CLASSNAMES.TOOLTIP}">
    <span class="${TWEET_AUTHOR_SCORE_CLASS}-text">${display}</span>
    <span class="${TOOLTIP_CLASSNAMES.TEXT}">${tooltipText}</span>
</div>
`;

const BEE_ICON = `
    <svg viewBox="0 0 36 36" class="${TWEET_AUTHOR_SCORE_CLASS}-icon">
        <use xlink:href="#HiveExtension-icon-bee" />
    </svg>
`;

export default class {
    settings;
    api;
    passedTweets;
    constructor(_settings, _api, passedTweets = []) {
        this.settings = _settings;
        this.api = _api;
        this.passedTweets = passedTweets;
    }

    async run() {
        let tweets = [];
        if (!this.passedTweets.length) {
            tweets = await waitUntilResult(getTweets);
        } else {
            tweets = this.passedTweets;
        }

        if (!tweets || !tweets.length) {
            throw new Error('Failed finding tweets');
        }

        // All statuses (tweets) have a url in which they link too, including some promoted tweets
        const r = /\/([A-Za-z0-9_]+)\/status\/([0-9]+)/;
        for (let i = 0; i < tweets.length; i++) {
            try {
                const tweetNode = tweets[i];
                if (tweetNode.classList.contains('promoted')) continue;
                // INFO: This doesn't work if the main tweet does not have retweets or likes
                const match = r.exec(tweetNode.innerHTML);
                if (!match) {
                    // Some promoted tweets will not have their own url however.
                    // These tweets do not have anchor tags with links to the status,
                    // instead they have javascript which navigates you to the tweets url.
                    if (!tweetNode.innerHTML.match(/>Promoted</)) {
                        // Fallback if the main tweet doesn't have any retweet or likes
                        const screenName = /(^|[^@\w])@(\w{1,15})\b/;
                        const screenNameMatch = screenName.exec(tweetNode.innerHTML);
                        if (!screenNameMatch) {
                            throw new Error(`Found unrecognisable <article> ${tweetNode.outerHTML}`);
                        }
                        let pathnameMatch = r.exec(location.pathname);
                        await this.injectOntoTweet(tweetNode, screenNameMatch[2], pathnameMatch[2]);
                        continue;
                    } else {
                        tweetNode.classList.add('promoted');
                        continue;
                    }
                }

                // Tweet authors screen name
                const screenName = match[1];
                const tweetId = match[2];
                let uniqueId = tweetId;
                // INFO: A user can retweet their own tweets and this will appear on their profile timeline
                // Appending -retweeted to the hive elem ID allows us to differentiate from the retweet and the original tweet
                if (tweetNode.innerHTML.match(/ Retweeted/)) {
                    uniqueId += '-retweeted';
                }
                await this.injectOntoTweet(tweetNode, screenName, uniqueId);
            } catch (error) {
                console.log('Error: ', error);
            }
        }
    }

    async injectOntoTweet(tweetNode, screenName, tweetId) {
        // Skip tweets from users who aren't within our available ids
        if (!this.api.isIdentifierIndexed(screenName)) return;
        const ICON_ID = `HiveExtension-Twitter_tweet-author-score_${tweetId}`;
        if (document.getElementById(ICON_ID)) return;

        const userData = await this.api.getFilteredTwitterUserData(screenName);
        if (!userData) {
            throw new Error(`Failed getting user data for tweet author @${screenName}`);
        }

        const injectableIcon = this.createIcon(userData, ICON_ID, tweetId);
        if (!injectableIcon) return;

        // Create popup
        const POPUP_ID = `HiveExtension-Twitter_TweetAuthor_Popup_${tweetId}`;
        const authorImageAnchor = this.getAuthorImageAnchor(tweetNode, screenName);
        const popupStyles = this.createPopupStyles(tweetNode, authorImageAnchor);

        // TODO: Replace this with attrs from the API once it gets added
        const authorImageURL = authorImageAnchor.getElementsByTagName('img')[0].src;

        let nameNode = [
            ...authorImageAnchor.parentElement.parentElement.parentElement.parentElement.getElementsByTagName('a'),
        ].find(item => {
            if (item.href == `https://twitter.com/${screenName}`) {
                return item !== authorImageAnchor;
            }
        });
        const name = nameNode.text.replace(`@${screenName}`, '');

        userData.avatarImage = authorImageURL;
        userData.name = name;

        await createHiveProfilePopup(this.settings, userData, injectableIcon, document.body, POPUP_ID, popupStyles);

        if (document.getElementById(ICON_ID)) return;
        const authorImageContainer = authorImageAnchor.parentNode.parentNode;
        authorImageContainer.insertAdjacentElement('afterend', injectableIcon);

        // If inside a thread, this will make sure the "main tweet" looks right.
        authorImageContainer.parentNode.parentNode.style.alignItems = 'flex-start';
    }

    createIcon(userData, nodeId, tweetId) {
        const { screenName, rank, score, clusterName } = userData;
        if (!rank && this.settings.shouldDisplayRank) {
            return;
        }

        const userScoreDisplay = document.createElement('div');
        userScoreDisplay.id = nodeId;
        userScoreDisplay.classList.add(`${TWEET_AUTHOR_SCORE_CLASS}-container`);

        let iconContent;
        if (rank && this.settings.shouldDisplayRank) {
            iconContent = `#${displayRank(rank)}`;
        } else if (this.settings.shouldDisplayScore) {
            iconContent = `[ ${displayScore(score)} ]`;
        } else if (this.settings.shouldDisplayIcon) {
            iconContent = BEE_ICON;
        } else {
            throw new Error(
                `Unrecognised displaySetting: "${
                    this.settings.displaySetting
                }" on tweet "${tweetId}" by "@${screenName}"`,
            );
        }

        userScoreDisplay.innerHTML = createTweetScoreIcon({ display: iconContent, tooltipText: `In ${clusterName}` });
        return userScoreDisplay;
    }

    createPopupStyles(tweetNode, authorImageAnchor) {
        // Twitters new design contains numerous instances of z-index: 0 not
        // only on every tweet, but several children nodes within the tweet.
        // This constant creation of new stacking contexts requires ugly hacky
        // solutions to display our popup.
        const authorImageRect = authorImageAnchor.getBoundingClientRect();

        const tweetRect = tweetNode.getBoundingClientRect();
        const left = tweetRect.left + 'px';
        const top = authorImageRect.top + window.pageYOffset + 80 + 'px';
        return { top, left };
    }

    getAuthorImageAnchor(tweetNode, screenName) {
        // crawls the children nodes of the tweet for the anchor tag that
        // wraps the tweet authors profile image
        const HREF = `https://twitter.com/${screenName}`;
        const testCondition = node =>
            node.tagName === 'A' && node.href === HREF && node.getAttribute('aria-haspopup') === 'false';
        const authorImageAnchor = depthFirstNodeSearch(tweetNode, testCondition);
        if (!authorImageAnchor) {
            throw new Error(`Failed finding tweet authors image tag: @${screenName}`);
        }

        return authorImageAnchor;
    }
}
