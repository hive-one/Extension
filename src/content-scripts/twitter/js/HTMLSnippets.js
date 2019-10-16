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
<a href="https://twitter.com/${node.screenName}" class="${POPUP_CLASS}_followers_follower">
    <div class="${POPUP_CLASS}_followers_follower_user">
        <img class="${POPUP_CLASS}_followers_follower_user_avatar" src='${node.imageUrl}' />
        <div class="${POPUP_CLASS}_followers_follower_user_info">
            <span class="${POPUP_CLASS}_followers_follower_user_info_name">${node.name}</span>
            <span class="${POPUP_CLASS}_followers_follower_user_info_screen_name">@${node.screenName}</span>
        </div>
    </div>
</a>
`;

// <img class="${POPUP_CLASS}_followers_follower_image" src="${node.imageUrl}" />
// <div class="${POPUP_CLASS}_followers_follower_name">@${node.screenName}</div>

const createFollowersSection = followers => `
    <div class="${POPUP_CLASS}_followers">
        ${followers.map(createFollower).join('')}
    </div>
`;

const createPodcastsSection = podcasts => {
    const createPodcast = ({ node }) => {
        const { name, episodeUrl, published, episodeName, hosts } = node;
        const safePodcastName = escapeHTML(name);
        const safeEpisodeName = escapeHTML(episodeName);
        const hostsList = hosts.edges.map(item => item.node.name).join(', ');

        const truncateText = input => (input.length > 50 ? `${input.substring(0, 50)}...` : input);

        let date = moment.unix(published);

        return `
            <a class="${POPUP_CLASS}_podcasts_podcast" rel="noopener noreferrer" href="${episodeUrl}" target='__blank'>
                <div class="${POPUP_CLASS}_podcasts_podcast_info">
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_podcast_name">${safePodcastName}</span>
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_episode_name">${truncateText(
            safeEpisodeName,
        )}</span>
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_host_list">${hostsList}<span>
                </div>
                <div class="${POPUP_CLASS}_podcasts_podcast_info_date">
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_date_day">${date.format('D')}</span>
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_date_month_year">${date.format('MMM YY')}</span>
                </div>
            </a>
        `;
    };
    return `
        <div class="${POPUP_CLASS}_podcasts">
            ${podcasts.map(createPodcast).join('')}
        </div>
    `;
};

const createPermissionsOverlay = () => {
    return `
    <div class="${POPUP_CLASS}_permissions_overlay">
        <div>
            <h3 class="${POPUP_CLASS}_permissions_overlay_heading">Hey, we <strong>anonymously</strong> track usage data as well as send error logs for diagnostics.</h3>
            <h3 class="${POPUP_CLASS}_permissions_overlay_heading">Is this cool?</h3>
        </div>
        <ul class="${POPUP_CLASS}_permissions_overlay_permissions_list">
            <li class="${POPUP_CLASS}_permissions_overlay_permissions_list_item">
                <div class="${POPUP_CLASS}_permissions_overlay_permissions_list_item_left">
                    <h4 class="${POPUP_CLASS}_permissions_overlay_permissions_list_item_heading">Google Analytics</h4>
                    <span>(Usage Data)</span>
                </div>
                <div class="${POPUP_CLASS}_permissions_overlay_permissions_list_item_right">
                    <label class="toggle">
                        <input class="toggle-checkbox" type="checkbox" checked>
                        <div class="toggle-switch"></div>
                    </label>
                </div>
            </li>
            <li class="${POPUP_CLASS}_permissions_overlay_permissions_list_item">
                <div class="${POPUP_CLASS}_permissions_overlay_permissions_list_item_left">
                    <h4 class="${POPUP_CLASS}_permissions_overlay_permissions_list_item_heading">Amplitude</h4>
                    <span>(Usage Data)</span>
                </div>
                <div class="${POPUP_CLASS}_permissions_overlay_permissions_list_item_right">
                    <label class="toggle">
                        <input class="toggle-checkbox" type="checkbox" checked>
                        <div class="toggle-switch"></div>
                    </label>
                </div>
            </li>
            <li class="${POPUP_CLASS}_permissions_overlay_permissions_list_item">
                <div class="${POPUP_CLASS}_permissions_overlay_permissions_list_item_left">
                    <h4 class="${POPUP_CLASS}_permissions_overlay_permissions_list_item_heading">Rollbar</h4>
                    <span>(Error Logging)</span>
                </div>
                <div class="${POPUP_CLASS}_permissions_overlay_permissions_list_item_right">
                    <label class="toggle">
                        <input class="toggle-checkbox" type="checkbox" checked>
                        <div class="toggle-switch"></div>
                    </label>
                </div>
            </li>
        </ul>
        <button class="${POPUP_CLASS}_permissions_overlay_submit_btn" id='permissions-submit-btn'>
            Accept
        </button>
    </div>
    `;
};

export const createPopupHTML = (
    screenName,
    userName,
    imageURL,
    scores,
    followers,
    podcasts,
    acceptedPermissions = true,
) => {
    let SCORES_HTML = createScoreSection(scores);
    let FOLLOWERS_HTML = '';
    let PODCASTS_HTML = '';
    let PODCASTS_TAB_HTML = '';
    let PERMISSIONS_OVERLAY_HTML = '';

    if (followers) {
        FOLLOWERS_HTML = createFollowersSection(followers);
    }

    if (podcasts && podcasts.length) {
        PODCASTS_HTML = createPodcastsSection(podcasts);
        PODCASTS_TAB_HTML = `<div id="podcasts_tab_btn" class="${POPUP_CLASS}_tab">
            <span>Podcasts</span>
        </div>`;
    }

    if (!acceptedPermissions) {
        PERMISSIONS_OVERLAY_HTML = createPermissionsOverlay();
    }

    return `
        ${PERMISSIONS_OVERLAY_HTML}
        <div>
            <div class="${POPUP_CLASS}_user_info_avatar">
                <img src='${imageURL}' />
            </div>
            <a href="https://twitter.com/${screenName}" class="${POPUP_CLASS}_user_info">
                <span class="${POPUP_CLASS}_user_info_name">${userName}</span>
                <span class="${POPUP_CLASS}_user_info_screen_name">@${screenName}</span>
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
            ${PODCASTS_TAB_HTML}
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

export const createHoverInjectedHTML = (screenName, scores, followers, podcasts, ownProfile = false) => {
    let SCORES_HTML = createScoreSection(scores);
    let FOLLOWERS_HTML = '';
    let PODCASTS_HTML = '';
    let PODCASTS_TAB_HTML = '';

    if (followers) {
        FOLLOWERS_HTML = createFollowersSection(followers);
    }

    if (podcasts && podcasts.length) {
        PODCASTS_HTML = createPodcastsSection(podcasts);
        PODCASTS_TAB_HTML = `<div id="podcasts_tab_btn" class="${POPUP_CLASS}_tab">
            <span>Podcasts</span>
        </div>`;
    }

    return `
        <br />
        <div class="${POPUP_CLASS}_tabs">
            <div id="scores_tab_btn" class="${POPUP_CLASS}_tab">
                <span>Scores</span>
            </div>
            <div id="followers_tab_btn" class="${POPUP_CLASS}_tab">
                <span>Top Followers</span>
            </div>
            ${PODCASTS_TAB_HTML}
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
                Learn more about ${ownProfile ? 'your' : 'this'} profile at hive.one
            </a>
        </div>
    `;
};
