import { GA_TYPES } from '../../../config';
import { createPopupHTML } from './HTMLSnippets';

const createHiveProfilePopup = async (settings, userData, clickableNode, appendableNode, popupId, popupStyles) => {
    // clickableNode = node that triggers the popup being created
    // appendableNode = node that popup is injected to

    const { screenName, podcasts, followers, scores } = userData;

    let popupNode, closePopup;
    const displayPopup = event => {
        event.stopPropagation();

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
        popupNode.innerHTML = createPopupHTML(screenName, scores, followers, podcasts);
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
