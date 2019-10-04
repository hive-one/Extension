// import { GA_TYPES } from '../../../config';
import { createHoverInjectedHTML } from './HTMLSnippets';

const createHiveHoverPopupProfile = async (settings, userData, appendableNode, popupId) => {
    // appendableNode = node that popup is injected to

    const { screenName, podcasts, followers, scores, avatarImage, name } = userData;

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
        popupNode.innerHTML = createHoverInjectedHTML(screenName, scores, followers, podcasts, avatarImage, name);

        const displayScoresTab = () => {
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
            if (popupNode.querySelector('#' + 'podcasts_tab_btn')) {
                popupNode
                    .querySelector('#' + 'podcasts_tab_btn')
                    .classList.remove('HiveExtension-Twitter_popup-profile_tab_active');
            }
        };

        popupNode.querySelector('#' + 'scores_tab_btn').addEventListener('click', displayScoresTab, false);
        popupNode.querySelector('#' + 'followers_tab_btn').addEventListener('click', displayFollowersTab, false);
        if (popupNode.querySelector('#' + 'podcasts_tab_btn')) {
            popupNode.querySelector('#' + 'podcasts_tab_btn').addEventListener('click', displayPodcastsTab, false);
        }
        displayScoresTab();
        appendableNode.appendChild(popupNode);

        // const ACTION_NAME = 'popup-opened-in-profile-header';
        // chrome.runtime.sendMessage({
        //     type: GA_TYPES.TRACK_EVENT,
        //     category: 'plugin-interactions',
        //     ACTION_NAME,
        // });
    };

    displayPopup();
};

export default createHiveHoverPopupProfile;
