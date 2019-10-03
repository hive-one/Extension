import { CONFIG } from '../../../config';
import escapeHTML from 'escape-html';
import moment from 'moment';

const POPUP_CLASS = 'HiveExtension-Twitter_popup-profile';

const CLUSTER_IMAGES = {
    Crypto: 'https://hive.one/static/assets/icons/Crypto_100.png',
    Bitcoin: 'https://hive.one/static/assets/icons/BTC_100.png',
    Ethereum: 'https://hive.one/static/assets/icons/ETH_100.png',
    Ripple: 'https://hive.one/static/assets/icons/XRP_100.png',
};

const createScoreRow = (clusterName, displayScore, scoreAsPercentage) => `
<div class="${POPUP_CLASS}_cluster-score">
    <div class="${POPUP_CLASS}_cluster-score_left">
        <img class="${POPUP_CLASS}_cluster-score_image" src='${CLUSTER_IMAGES[clusterName]}' />
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
            const roundedScore = Math.round(node.score);
            const percentage = Math.floor((roundedScore / CONFIG.MAX_SCORE) * 100);

            return createScoreRow(node.name, roundedScore, percentage);
        })
        .join('');

const createFollower = ({ node }) => `
<div class="${POPUP_CLASS}_followers_follower">
    <span>${1}</span>
    <div class="${POPUP_CLASS}_followers_follower_user">
        <img class="${POPUP_CLASS}_followers_follower_user_avatar" src='${node.imageUrl}' />
        <div class="${POPUP_CLASS}_followers_follower_user_info">
            <span class="${POPUP_CLASS}_followers_follower_user_info_name">${node.name}</span>
            <span class="${POPUP_CLASS}_followers_follower_user_info_screen_name">@${node.screenName}</span>
        </div>
    </div>
    <span>${1}</span>
</div>
`;

// <img class="${POPUP_CLASS}_followers_follower_image" src="${node.imageUrl}" />
// <div class="${POPUP_CLASS}_followers_follower_name">@${node.screenName}</div>

const createFollowersSection = followers => `
    <div class="${POPUP_CLASS}_followers_title">
        <span>Rank</span>
        <span>Name</span>
        <span>Score</span>
    </div>
    <div class="${POPUP_CLASS}_followers">
        ${followers.map(createFollower).join('')}
    </div>
`;

const createPodcastsSection = podcasts => {
    const createPodcast = ({ node }) => {
        const { name, episodeUrl, published, episodeName } = node;
        const safePodcastName = escapeHTML(name);
        const safeEpisodeName = escapeHTML(episodeName);

        const truncateText = input => (input.length > 5 ? `${input.substring(0, 30)}...` : input);

        let date = moment.unix(published);

        date = date.format('D MMMM YYYY');

        return `
            <a class="${POPUP_CLASS}_podcasts_podcast" rel="noopener noreferrer" href="${episodeUrl}" target='__blank'>
                <span>${truncateText(safePodcastName)}</span>
                <span class="${POPUP_CLASS}_podcasts_podcast_episode_name">${truncateText(safeEpisodeName)}</span>
                <span>${date}</span>
            </a>
        `;
    };
    return `
        <div class="${POPUP_CLASS}_podcasts_title">
            <span>Podcast</span>
            <span>Episode Name</span>
            <span>Date</span>
        </div>
        <div class="${POPUP_CLASS}_podcasts">
            ${podcasts.map(createPodcast).join('')}
        </div>
    `;
};

export const createPopupHTML = (screenName, scores, followers, podcasts, avatarImage, name) => {
    let SCORES_HTML = createScoreSection(scores);

    let FOLLOWERS_HTML = '';
    if (followers) {
        FOLLOWERS_HTML = createFollowersSection(followers);
    }

    let PODCASTS_HTML = '';
    if (podcasts && podcasts.length) {
        console.log(podcasts);
        PODCASTS_HTML = createPodcastsSection(podcasts);
    }

    return `
        <div>
            <div class="${POPUP_CLASS}_user_info_avatar">
                <img src='${avatarImage}' />
            </div>
            <a href="https://twitter.com/${screenName}/" class="${POPUP_CLASS}_user_info">
                <span class="${POPUP_CLASS}_user_info_name">${name}</span>
                <span class="${POPUP_CLASS}_user_info_screen-name">@${screenName}</span>
            </a>
        </div>
        <br/>
        <div class="${POPUP_CLASS}_tabs">
            <div id="scores_tab_btn" class="${POPUP_CLASS}_tab">
                <span>Scores</span>
            </div>
            <div id="followers_tab_btn" class="${POPUP_CLASS}_tab">
                <span>Top Followers</span>
            </div>
            <div id="podcasts_tab_btn" class="${POPUP_CLASS}_tab">
                <span>Podcasts</span>
            </div>
        </div>
        <br/>
        <div id='popup_scores' class="${POPUP_CLASS}_content">
            ${SCORES_HTML}
            <br/>
        </div>
        <div id='popup_followers'>
            ${FOLLOWERS_HTML}
            <br/>
        </div>
        <div id='popup_podcasts'>   
            ${PODCASTS_HTML}
        </div>
        <br/>
        <div class="${POPUP_CLASS}_credit">
            <svg viewBox="0 0 36 36" class="${POPUP_CLASS}_credit_icon">
                <use xlink:href="#HiveExtension-icon-bee" />
            </svg>
            <a href="https://hive.one/p/${screenName}/" target='__blank'>
                Learn more about this profile at hive.one
            </a>
        </div>
    `;
};
