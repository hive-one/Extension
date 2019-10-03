import { GA_TYPES } from '../../../config';
import { createPopupHTML } from './HTMLSnippets';

const createHiveProfilePopup = async (settings, userData, clickableNode, appendableNode, popupId, popupStyles) => {
    // clickableNode = node that triggers the popup being created
    // appendableNode = node that popup is injected to

    const { screenName, podcasts, followers, scores, avatarImage, name } = userData;

    const popUpExists = () => !!document.getElementById(popupId);

    let popupNode, closePopup;
    const displayPopup = event => {
        event.stopPropagation();

        if (popUpExists()) return;

        const removePopupElement = () => {
            document.removeEventListener('click', closePopup);
            document.getElementById(popupId).remove();
        };

        popupNode = document.createElement('div');
        popupNode.id = popupId;
        for (const key in popupStyles) {
            popupNode.style[key] = popupStyles[key];
        }
        popupNode.classList.add('HiveExtension-Twitter_popup-profile');
        if (settings.isDarkTheme) {
            popupNode.classList.add(`HiveExtension-Twitter_popup-profile-dark`);
        }
        popupNode.innerHTML = createPopupHTML(screenName, scores, followers, podcasts, avatarImage, name);

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
            popupNode
                .querySelector('#' + 'podcasts_tab_btn')
                .classList.remove('HiveExtension-Twitter_popup-profile_tab_active');
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
            popupNode
                .querySelector('#' + 'podcasts_tab_btn')
                .classList.remove('HiveExtension-Twitter_popup-profile_tab_active');
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
            popupNode
                .querySelector('#' + 'scores_tab_btn')
                .classList.remove('HiveExtension-Twitter_popup-profile_tab_active');
        };

        popupNode.querySelector('#' + 'scores_tab_btn').addEventListener('click', displayScoresTab, false);
        popupNode.querySelector('#' + 'followers_tab_btn').addEventListener('click', displayFollowersTab, false);
        popupNode.querySelector('#' + 'podcasts_tab_btn').addEventListener('click', displayPodcastsTab, false);
        displayScoresTab();
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
            type: GA_TYPES.TRACK_EVENT,
            category: 'plugin-interactions',
            ACTION_NAME,
        });
    };

    clickableNode.addEventListener('click', displayPopup, false);
};

export default createHiveProfilePopup;
