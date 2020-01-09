import { waitUntilResult, getTweets, depthFirstNodeSearch, errorHandle } from './utils';

import { h, render } from 'preact';

import TweetIcon from '../components/TweetIcon';

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
            return errorHandle('Failed finding tweets');
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
                        this.injectOntoTweet(tweetNode, screenNameMatch[2], pathnameMatch[2]);
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
                this.injectOntoTweet(tweetNode, screenName, uniqueId);
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

        let ICON = document.createElement('div');
        ICON.id = ICON_ID;

        let authorImageContainer = undefined;
        // The element that hold '@{screeName}' is consistent for both timeline and detailed tweet pages, but requires a different parentElement to append to
        if (location.pathname === `/${screenName}/status/${tweetId}`) {
            authorImageContainer = this.getAuthorNameAnchor(tweetNode, screenName).parentNode.parentNode.parentNode
                .parentNode.parentNode;
            authorImageContainer.style.flexDirection = 'row';
        } else {
            authorImageContainer = this.getAuthorNameAnchor(tweetNode, screenName).parentNode.parentNode.parentNode
                .parentNode.parentNode.parentNode;
        }

        const userData = await this.api.getFilteredTwitterUserData(screenName);

        if (!userData) {
            throw new Error(`Failed getting user data for tweet author @${screenName}`);
        }

        let props = {
            userData,
            tweetId,
            settings: this.settings,
            tweetNode,
            elem: ICON,
        };

        if (document.getElementById(ICON_ID)) return;

        authorImageContainer.appendChild(ICON);
        render(<TweetIcon {...props} />, ICON);
    }

    // createBEEIcon(nodeId, tweetId) {
    //     const userScoreDisplay = document.createElement('div');
    //     userScoreDisplay.id = nodeId;
    //     userScoreDisplay.classList.add(`${TWEET_AUTHOR_SCORE_CLASS}-container`);

    //     userScoreDisplay.innerHTML = createTweetScoreIcon({
    //         display: BEE_ICON,
    //         tooltipText: `Loading...`,
    //         tweetId,
    //     });
    //     return userScoreDisplay;
    // }

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

    getAuthorNameAnchor(tweetNode, screenName) {
        // crawls the children nodes of the tweet for the anchor tag that
        // wraps the tweet authors profile image
        const testCondition = node => node.tagName === 'SPAN' && node.textContent === `@${screenName}`;
        const authorImageAnchor = depthFirstNodeSearch(tweetNode, testCondition);
        if (!authorImageAnchor) {
            throw new Error(`Failed finding tweet authors image tag: @${screenName}`);
        }

        return authorImageAnchor;
    }
}
