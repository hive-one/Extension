import { HivePopup } from './components/Popup';

import { h, render } from 'preact';

const createHiveProfilePopup = async ({
    settings,
    userData,
    appendableNode,
    popupId,
    popupStyles,
    profilePreview = false,
    clickableNode = undefined,
    getNewStylesFunc = undefined,
} = {}) => {
    // appendableNode = node that popup is injected to

    const popUpExists = () => !!document.getElementById(popupId);
    const closePopupOnClick = e => {
        let popupNode = document.getElementById(popupId);
        // Weird bug where tge removeEventListner from removePopup does not work, this is a temp fix on the issue.
        if (!popupNode) {
            document.removeEventListener('click', closePopupOnClick, false);
            return;
        }
        if (!(e.target === popupNode || popupNode.contains(e.target))) {
            removePopup();
            document.removeEventListener('click', closePopupOnClick, false);
        }
    };
    let removePopup = () => {
        document.removeEventListener('click', closePopupOnClick, false);
        let popupElem = document.getElementById(popupId);
        popupElem.remove();
    };

    // It's likely that this should be a reason to close
    if (popUpExists()) {
        removePopup();
        return;
    }

    const getBackgroundColor = () => {
        return document.body.style.backgroundColor;
    };

    if (settings.isDarkTheme()) {
        popupStyles.background = getBackgroundColor();
    }

    let props = {
        settings,
        userData,
        popupStyles,
        profilePreview,
        clickableNode,
        getNewStyles: getNewStylesFunc,
    };

    let popupNode = document.createElement('div');
    popupNode.id = popupId;
    appendableNode.appendChild(popupNode);
    render(<HivePopup {...props} />, popupNode);
    document.addEventListener('click', closePopupOnClick, false);
};

export default createHiveProfilePopup;
