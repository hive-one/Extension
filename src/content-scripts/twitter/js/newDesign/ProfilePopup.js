import { CONFIG, MESSAGES } from '../../../../config';
import escapeHTML from 'escape-html';
import moment from 'moment';

const POPUP_CLASS = 'HiveExtension-Twitter_popup-profile';

const createScoreRow = (clusterName, displayScore, scoreAsPercentage) => `
<div class="${POPUP_CLASS}_cluster-score">
    <div class="${POPUP_CLASS}_cluster-score_left">
        ${clusterName}
    </div>
    <div class="${POPUP_CLASS}_cluster-score_right">
        <span class="${POPUP_CLASS}_cluster-score_right_bold">${displayScore}</span>
        <span class="${POPUP_CLASS}_cluster-score_right_small">/ 1000</span>
    </div>
    <div class="${POPUP_CLASS}_cluster-score_progress-bar">
        <div class="${POPUP_CLASS}_cluster-score_progress-bar_bg"></div>
        <div class="${POPUP_CLASS}_cluster-score_progress-bar_progress" style="width:${scoreAsPercentage}%"></div>
    </div>
</div>
`;

const createScoreSection = clusters =>
    clusters
        .map(({ node }) => {
            if (node.abbr === 'Crypto') {
                return;
            }

            const roundedScore = Math.round(node.score);
            const percentage = Math.floor((roundedScore / CONFIG.MAX_SCORE) * 100);

            return createScoreRow(node.name, roundedScore, percentage);
        })
        .join('');

const createFollower = ({ node }) => `
<div class="${POPUP_CLASS}_followers_follower">
    <img class="${POPUP_CLASS}_followers_follower_image" src="${node.imageUrl}" />
    <div class="${POPUP_CLASS}_followers_follower_name">@${node.screenName}</div>
</div>
`;

const createFollowersSection = followers => `
    <h3 class="${POPUP_CLASS}_title">Top Followers</h3>
    <div class="${POPUP_CLASS}_followers">
        ${followers.map(createFollower).join('')}
    </div>
`;

const createPodcastsSection = podcasts => {
    const currentYear = moment().format('YYYY');
    const createPodcast = ({ node }) => {
        const { name, episodeUrl, published } = node;
        const safePodcastName = escapeHTML(name);

        let date = moment.unix(published);

        if (date.format('YYYY') === currentYear) {
            date = date.format('D MMMM');
        } else {
            date = date.format('D MMMM YYYY');
        }

        return `
            <a class="${POPUP_CLASS}_podcasts_podcast" rel="noopener noreferrer" href="${episodeUrl}">
                - ${safePodcastName}
                <span class="${POPUP_CLASS}_podcasts_podcast_meta">- ${date}</span>
            </a>
        `;
    };
    return `
        <h3 class="${POPUP_CLASS}_title">Recent Podcasts</h3>
        <div class="${POPUP_CLASS}_podcasts">
            ${podcasts.map(createPodcast).join('')}
        </div>
    `;
};

const createPopupHTML = (screenName, scores, followers, podcasts) => {
    let SCORES_HTML = createScoreSection(scores);

    let FOLLOWERS_HTML = '';
    if (followers) {
        FOLLOWERS_HTML = createFollowersSection(followers);
    }

    let PODCASTS_HTML = '';
    if (podcasts && podcasts.length) {
        PODCASTS_HTML = createPodcastsSection(podcasts);
    }

    return `
        <div class="${POPUP_CLASS}_content">
            ${SCORES_HTML}
        </div>
        <br/>
        ${FOLLOWERS_HTML}
        <br/>
        ${PODCASTS_HTML}
        <br/>
        <a href="https://hive.one/p/${screenName}/" class="${POPUP_CLASS}_credit">
            Learn more about this profile at hive.one
            <svg viewBox="0 0 36 36" class="${POPUP_CLASS}_credit_icon">
            <use xlink:href="#hive-icon" />
            </svg>
        </a>
    `;
};

const createProfilePopup = async (settings, userData, clickableNode, appendableNode) => {
    // clickableNode = node that triggers the popup being created
    // appendableNode = node that popup is injected to

    const { screenName, podcasts, followers, scores } = userData;
    const POPUP_ID = `HiveExtension-Twitter_Profile_Popup_${screenName}`;

    let popupNode, closePopup;
    const displayPopup = event => {
        event.stopPropagation();

        const removePopupElement = () => {
            document.removeEventListener('click', closePopup);
            document.getElementById(POPUP_ID).remove();
        };

        popupNode = document.createElement('div');
        popupNode.id = POPUP_ID;
        popupNode.classList.add(POPUP_CLASS);
        if (settings.isDarkTheme) {
            popupNode.classList.add(`${POPUP_CLASS}-dark`);
        }
        popupNode.innerHTML = createPopupHTML(screenName, scores, followers, podcasts);
        popupNode.style.top = '254px';
        popupNode.style.right = 0;
        appendableNode.appendChild(popupNode);

        setTimeout(() => {
            closePopup = e => {
                if (e.target === popupNode || popupNode.contains(e.target)) {
                    return;
                }
                e.stopPropagation();
                removePopupElement();
            };

            document.addEventListener('click', closePopup);
        }, 0);

        const ACTION_NAME = 'popup-opened-in-profile-header';
        chrome.runtime.sendMessage({
            type: MESSAGES.TRACK_EVENT,
            category: 'plugin-interactions',
            ACTION_NAME,
        });
    };

    clickableNode.addEventListener('click', displayPopup, false);
};

export default createProfilePopup;
