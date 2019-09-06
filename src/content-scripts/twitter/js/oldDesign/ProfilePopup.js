import { CONFIG, MESSAGES } from '../../../../config';
import escapeHTML from 'escape-html';
import moment from 'moment';

let openPopupsCloseHandlers = [];

export class ProfilePopup {
    api;
    userTwitterId;
    settings;

    constructor(_userTwitterId, _api, _settings) {
        this.userTwitterId = _userTwitterId;
        this.api = _api;
        this.settings = _settings;
    }

    async showOnClick(displayElement) {
        const scores = await this.api.getTwitterUserScores(this.userTwitterId);
        const topFollowersCluster = await this.settings.getOptionValue('topFollowersCluster');
        const { podcasts, followers } = await this.api.getTwitterUserData(this.userTwitterId, topFollowersCluster);

        let popupNode, closePopup;

        const displayPopup = event => {
            const POPUP_CLASS = 'HiveExtension-Twitter_popup-profile';
            const POPUP_HIDDEN_CLASS = `${POPUP_CLASS}-hidden`;

            const removePopupElement = () => {
                displayElement.querySelector(`.${POPUP_CLASS}`).remove();
                document.removeEventListener('click', closePopup);

                if (openPopupsCloseHandlers.length === 1) {
                    openPopupsCloseHandlers = [];
                }
            };

            const closeAllPopups = () => {
                openPopupsCloseHandlers.forEach(popupCloseHandler => popupCloseHandler(event));
                openPopupsCloseHandlers = [];
            };

            event.stopPropagation();

            if (displayElement.querySelector(`.${POPUP_CLASS}`)) {
                if (popupNode && (event.target !== popupNode && !popupNode.contains(event.target))) {
                    closeAllPopups();
                }

                return;
            }

            closeAllPopups();

            popupNode = document.createElement('div');
            popupNode.classList.add(POPUP_CLASS);

            if (this.settings.isDarkTheme) {
                popupNode.classList.add(`${POPUP_CLASS}-dark`);
            }

            popupNode.classList.add(POPUP_HIDDEN_CLASS);

            let clustersHTML = ``;

            scores.map(({ node: cluster }) => {
                if (cluster.abbr === 'Crypto') {
                    return;
                }

                const roundedScore = Math.round(cluster.score);
                const percentage = Math.floor((roundedScore / CONFIG.MAX_SCORE) * 100);

                clustersHTML += `
              <div class="HiveExtension-Twitter_popup-profile_cluster-score">
                  <div class="HiveExtension-Twitter_popup-profile_cluster-score_left">
                      ${escapeHTML(cluster.name)}
                  </div>
                  <div class="HiveExtension-Twitter_popup-profile_cluster-score_right">
                      <span class="HiveExtension-Twitter_popup-profile_cluster-score_right_bold">${roundedScore}</span>
                      <span class="HiveExtension-Twitter_popup-profile_cluster-score_right_small">/ 1000</span>
                  </div>
                  <div class="HiveExtension-Twitter_popup-profile_cluster-score_progress-bar">
                      <div class="HiveExtension-Twitter_popup-profile_cluster-score_progress-bar_bg"></div>
                      <div class="HiveExtension-Twitter_popup-profile_cluster-score_progress-bar_progress" style="width:${percentage}%"></div>
                  </div>
              </div>
              `;
            });

            let FOLLOWERS_HTML = '';

            if (followers) {
                FOLLOWERS_HTML += `
        <br/>
        <h3 class="${POPUP_CLASS}_title">Top Followers</h3>
        <div class="${POPUP_CLASS}_followers">`;

                followers.forEach(({ node }) => {
                    const { screenName } = node;
                    const safeScreenName = escapeHTML(screenName);

                    FOLLOWERS_HTML += `
                        <div class="${POPUP_CLASS}_followers_follower">
                            <img class="${POPUP_CLASS}_followers_follower_image" src="https://twitter.com/${safeScreenName}/profile_image?size=bigger" />
                            <div class="${POPUP_CLASS}_followers_follower_name">${safeScreenName}</div>
                        </div>
                    `;
                });

                FOLLOWERS_HTML += `</div>`;
            }

            let PODCASTS_HTML = '';

            if (podcasts && podcasts.length) {
                PODCASTS_HTML += `
        <br/>
        <h3 class="${POPUP_CLASS}_title">Recent Podcasts</h3>
        <div class="${POPUP_CLASS}_podcasts">`;

                const currentYear = moment().format('YYYY');

                podcasts.forEach(({ node }) => {
                    const safePodcastName = escapeHTML(node.name);

                    let date = moment.unix(node.published);

                    if (date.format('YYYY') === currentYear) {
                        date = date.format('D MMMM');
                    } else {
                        date = date.format('D MMMM YYYY');
                    }

                    PODCASTS_HTML += `
                        <a class="${POPUP_CLASS}_podcasts_podcast" rel="noopener noreferrer" href="${escapeHTML(
                        node.episodeUrl,
                    )}">
                            - ${safePodcastName}
                            <span class="${POPUP_CLASS}_podcasts_podcast_meta">- ${date}</span>
                        </a>
                    `;
                });

                PODCASTS_HTML += `</div>`;
            }

            const CUSTOM_HTML = `
                <div class="${POPUP_CLASS}_content">
                    ${clustersHTML}
                </div>
                ${FOLLOWERS_HTML}
                ${PODCASTS_HTML}
                <br/>
                <a href="https://hive.one/profile/${escapeHTML(this.userTwitterId)}" class="${POPUP_CLASS}_credit">
                  Learn more about this profile at hive.one
                  <svg viewBox="0 0 36 36" class="${POPUP_CLASS}_credit_icon">
                    <use xlink:href="#hive-icon" />
                  </svg>
                </a>
          `;
            popupNode.innerHTML = CUSTOM_HTML;

            displayElement.appendChild(popupNode);

            const { top } = popupNode.getBoundingClientRect();

            const offsetFromTrigger = 6;
            const collidingElementsHeight = 50;

            const positionChange = popupNode.offsetHeight + offsetFromTrigger;

            let newTopChange = -(popupNode.offsetHeight + offsetFromTrigger);

            if (top >= positionChange + collidingElementsHeight) {
                popupNode.style.top = `${newTopChange}px`;
            }

            popupNode.classList.remove(POPUP_HIDDEN_CLASS);

            setTimeout(() => {
                closePopup = event => {
                    if (event.target === popupNode || popupNode.contains(event.target)) {
                        return;
                    }

                    event.stopPropagation();

                    removePopupElement();
                };

                document.addEventListener('click', closePopup);

                openPopupsCloseHandlers.push(closePopup);
            }, 0);

            let action = 'popup-opened-in-tweet-stream';

            if (displayElement.classList.contains('ProfileNav-item')) {
                action = 'popup-opened-in-profile-header';
            }

            chrome.runtime.sendMessage({
                type: MESSAGES.TRACK_EVENT,
                category: 'plugin-interactions',
                action,
            });
        };

        displayElement.addEventListener('click', displayPopup, false);
    }
}
