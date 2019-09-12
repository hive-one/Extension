// This component renders a rank/score on a users profile
// eg. twitter.com/aantonop && twitter.com/aantonop/followers
import { waitUntilResult, getProfileImage } from './utils';
import createProfilePopup from './ProfilePopup';

const PROILE_NAV_ICON_ID = 'HiveExtension_Twitter_ProfileNav';

const createNavIconHTML = value => `
    <span class="${PROILE_NAV_ICON_ID}-value" data-count="${value}" data-is-compact="false">${value}</span>
`;

const profileNavIconExists = () => !!document.getElementById(PROILE_NAV_ICON_ID);

class ProfileNav {
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
            throw new Error(`Failed finding profile image for ${this.screenName}`);
        }

        if (profileNavIconExists()) return;

        const userData = await this.api.getFilteredTwitterUserData(this.screenName);
        if (!userData) return;
        // const { rank, clusterName, score } = userData;
        const { rank, score } = userData;

        // TODO: add tooltip
        // let tooltip;
        let value;

        const option = await this.settings.getOptionValue('displaySetting');

        if (['showRanksWithScoreFallback', 'showRanks'].includes(option) && rank) {
            value = `#${rank}`;
            // tooltip = `${rank} Rank ${rank}`;
        } else if (option !== 'showRanks') {
            value = Math.round(score);
            // tooltip = `${clusterName} Score ${value}`;
        }

        const profileNavIcon = document.createElement('div');

        // contains actions such as follow/unfollow, message, notifications on/off
        const profileActionsList = profileImageAnchor.nextSibling;
        // The following classnames are from the other icons in the list
        const firstActionItem = profileActionsList.firstChild;
        if (firstActionItem.id === PROILE_NAV_ICON_ID) return;
        const adjacentClasses = profileActionsList.firstChild.className;
        if (!adjacentClasses) {
            throw new Error('Failed finding adjacent classNames in profileActionsList');
        }

        profileNavIcon.id = PROILE_NAV_ICON_ID;
        profileNavIcon.className = adjacentClasses;
        profileNavIcon.innerHTML = createNavIconHTML(value);

        const POPUP_ID = `HiveExtension_Twitter_Popup_Profile_${this.screenName}`;
        // const POPUP_CLASS = 'HiveExtension_Twitter_Popup_Profile';
        await createProfilePopup(
            this.settings,
            userData,
            profileNavIcon,
            profileImageAnchor.parentNode.parentNode.parentNode.parentNode,
            POPUP_ID,
            { top: '254px', right: 0 },
        );

        profileActionsList.insertBefore(profileNavIcon, profileActionsList.firstChild);
    }
}

export default ProfileNav;
