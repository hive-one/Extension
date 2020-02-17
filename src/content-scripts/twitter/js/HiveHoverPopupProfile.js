import { HiveInjectedPopup } from './components/Popup';

import { h, render } from 'preact';

const createHiveHoverPopupProfile = async ({
    settings,
    userData,
    appendableNode,
    popupId,
    popupStyles = {},
    ownProfile = false,
} = {}) => {
    const popUpExists = () => !!document.getElementById(popupId);
    if (popUpExists()) return;

    let popupNode = document.createElement('div');
    popupNode.id = popupId;

    let props = {
        settings,
        userData,
        popupStyles,
        ownProfile,
    };

    appendableNode.appendChild(popupNode);
    render(<HiveInjectedPopup {...props} />, popupNode);
};

export default createHiveHoverPopupProfile;
