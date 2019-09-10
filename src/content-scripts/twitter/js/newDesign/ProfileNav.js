// This component renders a rank/score on a users profile
// eg. twitter.com/aantonop && twitter.com/aantonop/followers
import { waitUntilResult, getProfileImage } from './utils';
// import { ProfilePopup } from '../oldDesign/ProfilePopup';
import createProfilePopup from './ProfilePopup';

const PROILE_NAV_ICON_ID = 'HiveExtension_Twitter_ProfileNav';

const createNavIconHTML = (classes, tooltip, value) => `
<div id="${PROILE_NAV_ICON_ID}" class="${classes} HiveExtension-Twitter_profile_rank-container" href="#" data-original-title="${tooltip}">
    <span class="ProfileNav-value" data-count="${value}" data-is-compact="false">
        ${value}
    </span>
</div>
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
        if (!profileNavIconExists()) {
            await this.injectProfileNavIcon();
        }
    }

    async injectProfileNavIcon() {
        const profileImageAnchor = await waitUntilResult(() => getProfileImage(this.screenName));
        if (!profileImageAnchor) {
            throw new Error(`Failed finding profile image for ${this.screenName}`);
        }

        const userData = await this.api.getFilteredTwitterUserData(this.screenName);
        if (!userData) return;
        const { rank, clusterName, score } = userData;

        // TODO: add tooltip
        let tooltip = '';
        let value = '';

        const option = await this.settings.getOptionValue('displaySetting');

        if (['showRanksWithScoreFallback', 'showRanks'].includes(option) && rank) {
            value = `#${rank}`;
            tooltip = `${rank} Rank ${rank}`;
        } else if (option !== 'showRanks') {
            value = Math.round(score);
            tooltip = `${clusterName} Score ${value}`;
        }

        const profileNavIcon = document.createElement('div');

        // contains actions such as follow/unfollow, message, notifications on/off
        const profileActionsList = profileImageAnchor.nextSibling;
        // The following classnames are from the other icons in the list
        const adjacentClasses = profileActionsList.firstChild.className;
        if (!adjacentClasses) {
            throw new Error('Failed finding adjacent classNames in profileActionsList');
        }
        profileNavIcon.innerHTML = createNavIconHTML(adjacentClasses, tooltip, value);

        await createProfilePopup(
            this.settings,
            userData,
            profileNavIcon,
            profileImageAnchor.parentNode.parentNode.parentNode.parentNode,
        );

        profileActionsList.insertBefore(profileNavIcon, profileActionsList.firstChild);
    }
}

export default ProfileNav;
