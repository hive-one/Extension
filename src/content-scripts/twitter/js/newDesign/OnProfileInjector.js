// This component renders a rank/score on a users profile
// eg. twitter.com/aantonop && twitter.com/aantonop/followers
import { waitUntilResult, getProfileImage } from './utils';

import { h, render } from 'preact';

import HeaderIcon from '../components/HeaderIcon';

const PROILE_NAV_ICON_ID = 'HiveExtension_Twitter_ProfileNav';

const profileNavIconExists = () => !!document.getElementById(PROILE_NAV_ICON_ID);

export default class {
    settings;
    api;
    screenName;
    constructor(_settings, _api, _screenName) {
        this.settings = _settings;
        this.api = _api;
        this.screenName = _screenName;
    }

    async run() {
        const profileImageAnchor = await waitUntilResult(() => getProfileImage(this.screenName));
        if (!profileImageAnchor) {
            return;
        }

        // Check to see if the hive profile element already exists
        // If so and if the screenName is not the same then remove it and continue
        if (profileNavIconExists()) {
            let existingElement = document.getElementById(PROILE_NAV_ICON_ID);
            if (existingElement.dataset.screenName == this.screenName) return;
            existingElement.remove();
        }

        const userData = await this.api.getFilteredTwitterUserData(this.screenName);
        if (!userData) return;

        const profileNavIcon = document.createElement('div');

        // contains actions such as follow/unfollow, message, notifications on/off
        const profileActionsList = profileImageAnchor.nextSibling;
        // The following classnames are from the other icons in the list
        const firstActionItem = profileActionsList.firstChild;
        if (firstActionItem.id === PROILE_NAV_ICON_ID) {
            if (document.getElementById(PROILE_NAV_ICON_ID).dataset.screenName == this.screenName) return;
        }
        const adjacentClasses = profileActionsList.firstChild.className;
        if (!adjacentClasses) {
            throw new Error('Failed finding adjacent classNames in profileActionsList');
        }

        let props = {
            screenName: this.screenName,
            userData,
            settings: this.settings,
            adjacentClasses,
            popupAppendableNode: profileImageAnchor.parentNode.parentNode.parentNode.parentNode,
        };

        profileNavIcon.id = PROILE_NAV_ICON_ID;
        profileNavIcon.dataset.screenName = this.screenName;

        profileActionsList.insertBefore(profileNavIcon, profileActionsList.firstChild);
        render(<HeaderIcon {...props} />, profileNavIcon);
    }
}
