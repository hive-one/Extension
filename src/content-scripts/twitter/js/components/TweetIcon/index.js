import { h, Component } from 'preact';

import { TOOLTIP_CLASSNAMES, GA_TYPES } from '../../../../../config';
import { depthFirstNodeSearch, displayRank, displayScore } from '../../newDesign/utils';

import createHiveProfilePopup from '../../HiveProfilePopup';

const TWEET_AUTHOR_SCORE_CLASS = 'HiveExtension_Twitter_TweetAuthor';

export default class TweetIcon extends Component {
    onClick = e => {
        e.preventDefault();
        e.stopPropagation();

        const ACTION_NAME = 'popup-opened-in-tweet';
        chrome.runtime.sendMessage({
            type: GA_TYPES.TRACK_EVENT,
            category: 'plugin-interactions',
            action: ACTION_NAME,
        });

        const authorImageAnchor = this.getAuthorImageAnchor(this.props.tweetNode, this.props.userData.screenName);
        const popupStyles = this.createPopupStyles(this.props.elem, authorImageAnchor);

        const POPUP_ID = `HiveExtension-Twitter_TweetAuthor_Popup_${this.props.tweetId}`;

        createHiveProfilePopup(this.props.settings, this.props.userData, document.body, POPUP_ID, popupStyles);
    };

    onMouseEnter = e => {
        if (e.target) {
            const ACTION_NAME = 'rank/score-hovered-in-tweet';
            chrome.runtime.sendMessage({
                type: GA_TYPES.TRACK_EVENT,
                category: 'plugin-interactions',
                action: ACTION_NAME,
            });
        }
    };

    createPopupStyles(tweetNode, authorImageAnchor) {
        // Twitters new design contains numerous instances of z-index: 0 not
        // only on every tweet, but several children nodes within the tweet.
        // This constant creation of new stacking contexts requires ugly hacky
        // solutions to display our popup.
        const authorImageRect = authorImageAnchor.getBoundingClientRect();

        const tweetRect = tweetNode.getBoundingClientRect();
        const left = tweetRect.left + 'px';
        const top = authorImageRect.top + window.pageYOffset + 40 + 'px';
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

    tooltipSitsInsideTweet = () => {
        function sitsInsideTweet(parentNode, childNode) {
            var parentRect = parentNode.getBoundingClientRect();
            var childRect = childNode.getBoundingClientRect();

            return parentRect.width + parentRect.left >= childRect.right;
        }

        let tooltip = document.querySelector(
            `span[class="${TOOLTIP_CLASSNAMES.TEXT} ${TOOLTIP_CLASSNAMES.TEXT}_tweet ${TOOLTIP_CLASSNAMES.TEXT}_${
                this.props.tweetId
            }"]`,
        );

        if (!sitsInsideTweet(this.props.tweetNode, tooltip)) {
            tooltip.classList.add(`${TOOLTIP_CLASSNAMES.TEXT}_tweet_left`);
        }
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.tooltipSitsInsideTweet();
    }

    render() {
        const { rank, score, clusterName } = this.props.userData;
        let iconContent;

        if (this.props.settings.shouldDisplayRank) {
            if (rank) {
                iconContent = `#${displayRank(rank)}`;
            } else if (score) {
                iconContent = `[ ${displayScore(score)} ]`;
            }
        } else if (this.props.settings.shouldDisplayScore) {
            if (score) {
                iconContent = `[ ${displayScore(score)} ]`;
            }
        } else if (this.props.settings.shouldDisplayIcon) {
            iconContent = '';
        } else {
            throw new Error(`Unrecognised displaySetting: "${this.props.settings.displaySetting}"`);
        }

        let display = iconContent;
        let tooltipText = clusterName;

        return (
            <div
                className={`${TWEET_AUTHOR_SCORE_CLASS} ${TOOLTIP_CLASSNAMES.TOOLTIP}`}
                onClick={this.onClick}
                onMouseEnter={this.onMouseEnter}
            >
                <span className={`${TWEET_AUTHOR_SCORE_CLASS}-text`}>
                    <svg viewBox="0 0 36 36" className={`${TWEET_AUTHOR_SCORE_CLASS}-icon`}>
                        <use href="#HiveExtension-icon-bee" />
                    </svg>
                    {display}
                </span>
                <span
                    className={`${TOOLTIP_CLASSNAMES.TEXT} ${TOOLTIP_CLASSNAMES.TEXT}_tweet ${
                        TOOLTIP_CLASSNAMES.TEXT
                    }_${this.props.tweetId}`}
                >
                    {tooltipText}
                </span>
            </div>
        );
    }
}
