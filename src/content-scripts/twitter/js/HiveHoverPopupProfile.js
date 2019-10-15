import { GA_TYPES } from '../../../config';
import { createHoverInjectedHTML } from './HTMLSnippets';

const createHiveHoverPopupProfile = async (
    settings,
    userData,
    appendableNode,
    popupId,
    popupStyles = {},
    ownProfile = false,
) => {
    // appendableNode = node that popup is injected to

    const { screenName, podcasts, followers, scores } = userData;

    const popUpExists = () => !!document.getElementById(popupId);

    let popupNode;
    const displayPopup = () => {
        if (popUpExists()) return;

        popupNode = document.createElement('div');
        popupNode.id = popupId;
        // popupNode.classList.add('HiveExtension-Twitter_popup-profile');
        // if (settings.isDarkTheme) {
        //     popupNode.classList.add(`HiveExtension-Twitter_popup-profile-dark`);
        // }
        for (const key in popupStyles) {
            popupNode.style[key] = popupStyles[key];
        }
        popupNode.innerHTML = createHoverInjectedHTML(screenName, scores, followers, podcasts, ownProfile);

        const displayScoresTab = (ignoreAnalyticsEvent = false) => {
            popupNode.querySelector('#' + 'popup_scores').style.display = 'block';
            popupNode.querySelector('#' + 'popup_followers').style.display = 'none';
            popupNode.querySelector('#' + 'popup_podcasts').style.display = 'none';

            popupNode
                .querySelector('#' + 'scores_tab_btn')
                .classList.add('HiveExtension-Twitter_popup-profile_tab_active');
            popupNode
                .querySelector('#' + 'followers_tab_btn')
                .classList.remove('HiveExtension-Twitter_popup-profile_tab_active');
            if (popupNode.querySelector('#' + 'podcasts_tab_btn')) {
                popupNode
                    .querySelector('#' + 'podcasts_tab_btn')
                    .classList.remove('HiveExtension-Twitter_popup-profile_tab_active');
            }

            if (!ignoreAnalyticsEvent) {
                const ACTION_NAME = 'popup-clicked-scores-tab';
                chrome.runtime.sendMessage({
                    type: GA_TYPES.TRACK_EVENT,
                    category: 'plugin-interactions',
                    action: ACTION_NAME,
                });
            }
        };

        const displayFollowersTab = () => {
            popupNode.querySelector('#' + 'popup_followers').style.display = 'block';
            popupNode.querySelector('#' + 'popup_scores').style.display = 'none';
            popupNode.querySelector('#' + 'popup_podcasts').style.display = 'none';

            popupNode
                .querySelector('#' + 'followers_tab_btn')
                .classList.add('HiveExtension-Twitter_popup-profile_tab_active');
            popupNode
                .querySelector('#' + 'scores_tab_btn')
                .classList.remove('HiveExtension-Twitter_popup-profile_tab_active');
            if (popupNode.querySelector('#' + 'podcasts_tab_btn')) {
                popupNode
                    .querySelector('#' + 'podcasts_tab_btn')
                    .classList.remove('HiveExtension-Twitter_popup-profile_tab_active');
            }
            const ACTION_NAME = 'popup-clicked-followers-tab';
            chrome.runtime.sendMessage({
                type: GA_TYPES.TRACK_EVENT,
                category: 'plugin-interactions',
                action: ACTION_NAME,
            });
        };

        const displayPodcastsTab = () => {
            popupNode.querySelector('#' + 'popup_podcasts').style.display = 'block';
            popupNode.querySelector('#' + 'popup_followers').style.display = 'none';
            popupNode.querySelector('#' + 'popup_scores').style.display = 'none';

            popupNode
                .querySelector('#' + 'podcasts_tab_btn')
                .classList.add('HiveExtension-Twitter_popup-profile_tab_active');
            popupNode
                .querySelector('#' + 'followers_tab_btn')
                .classList.remove('HiveExtension-Twitter_popup-profile_tab_active');
            const ACTION_NAME = 'popup-clicked-podcasts-tab';
            chrome.runtime.sendMessage({
                type: GA_TYPES.TRACK_EVENT,
                category: 'plugin-interactions',
                action: ACTION_NAME,
            });
        };

        popupNode.querySelector('#' + 'scores_tab_btn').addEventListener('click', displayScoresTab, false);
        popupNode.querySelector('#' + 'followers_tab_btn').addEventListener('click', displayFollowersTab, false);
        if (popupNode.querySelector('#' + 'podcasts_tab_btn')) {
            popupNode.querySelector('#' + 'podcasts_tab_btn').addEventListener('click', displayPodcastsTab, false);
        }
        displayScoresTab(true);
        appendableNode.appendChild(popupNode);
    };

    displayPopup();
};

export default createHiveHoverPopupProfile;
