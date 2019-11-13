import { GA_TYPES } from '../../../config';
import { createPopupHTML } from './HTMLSnippets';

const createHiveProfilePopup = async (settings, userData, clickableNode, appendableNode, popupId, popupStyles) => {
    // clickableNode = node that triggers the popup being created
    // appendableNode = node that popup is injected to

    const { screenName, userName, imageUrl, podcasts, followers, scores } = userData;

    const popUpExists = () => !!document.getElementById(popupId);

    let popupNode, closePopup;
    const displayPopup = async event => {
        if (event) {
            event.stopPropagation();
        }

        // Check to see if a a twitter profile hover is available
        let profilePopups = document.getElementsByClassName('r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-184en5c');

        if (profilePopups.length !== 0) {
            return;
        }

        // let acceptedPermissions = await settings.getOptionValue('acceptedPermissions');
        let acceptedPermissions = true;

        const removePopupElement = () => {
            document.removeEventListener('click', closePopup);
            document.getElementById(popupId).remove();
        };

        const renderPopupElement = popupNode => {
            popupNode.innerHTML = createPopupHTML(
                screenName,
                userName,
                imageUrl,
                scores,
                followers,
                podcasts,
                acceptedPermissions,
            );

            if (popupNode.querySelector('#hive-accept-permissions')) {
                popupNode.querySelector('#hive-accept-permissions').addEventListener(
                    'click',
                    () => {
                        chrome.storage.sync.set({
                            acceptedPermissions: true,
                        });
                        displayPopup();
                    },
                    false,
                );
            }

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

            setTimeout(() => {
                closePopup = e => {
                    // console.log(e.target);
                    if (e.target === popupNode || popupNode.contains(e.target)) {
                        return;
                    }
                    e.stopPropagation();
                    removePopupElement();
                };

                document.addEventListener('click', closePopup);
            }, 0);
        };

        const getBackgroundColor = () => {
            return document.body.style.backgroundColor;
        };

        // TODO: Figure out a way to render the popup again ONLY when accepting permissions
        if (popUpExists()) {
            // renderPopupElement(document.getElementById(popupId));
            return;
        }

        popupNode = document.createElement('div');
        popupNode.id = popupId;
        for (const key in popupStyles) {
            popupNode.style[key] = popupStyles[key];
        }
        popupNode.classList.add('HiveExtension-Twitter_popup-profile');
        if (settings.isDarkTheme()) {
            popupNode.classList.add(`HiveExtension-Twitter_popup-profile-dark`);
            popupNode.style.background = getBackgroundColor();
        }

        renderPopupElement(popupNode);

        const ACTION_NAME = 'popup-opened-in-profile-header';
        chrome.runtime.sendMessage({
            type: GA_TYPES.TRACK_EVENT,
            category: 'plugin-interactions',
            action: ACTION_NAME,
        });
    };

    clickableNode.addEventListener('click', displayPopup, false);
};

export default createHiveProfilePopup;
