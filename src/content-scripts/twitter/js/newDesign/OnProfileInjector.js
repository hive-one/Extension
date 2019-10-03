// This component renders a rank/score on a users profile
// eg. twitter.com/aantonop && twitter.com/aantonop/followers
import createHiveProfilePopup from '../HiveProfilePopup';
import { waitUntilResult, getProfileImage, displayRank, displayScore } from './utils';
import { TOOLTIP_CLASSNAMES } from '../../../../config';

const PROILE_NAV_ICON_ID = 'HiveExtension_Twitter_ProfileNav';

const createNavIconHTML = ({ display = '', tooltipText = '' }) => `
    <div class="${TOOLTIP_CLASSNAMES.TOOLTIP} ${PROILE_NAV_ICON_ID}-container">
        <span class="${PROILE_NAV_ICON_ID}-display">${display}</span>
        <span class="${TOOLTIP_CLASSNAMES.TEXT}">${tooltipText}</span>
    <div>
`;

const BEE_ICON = `
    <svg viewBox="0 0 36 36" class="${PROILE_NAV_ICON_ID}-icon">
        <use xlink:href="#HiveExtension-icon-bee" />
    </svg>
`;

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
            throw new Error(`Failed finding profile image for ${this.screenName}`);
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
        const { rank, score, clusterName } = userData;

        let iconContent;
        if (rank && this.settings.shouldDisplayRank) {
            iconContent = `#${displayRank(rank)}`;
        } else if (this.settings.shouldDisplayScore) {
            iconContent = displayScore(score);
        } else if (this.settings.shouldDisplayIcon) {
            iconContent = BEE_ICON;
        } else {
            throw new Error(
                `Unrecognised displaySetting: "${this.settings.displaySetting}" on "@${this.screenName}"'s profile.`,
            );
        }

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

        profileNavIcon.id = PROILE_NAV_ICON_ID;
        profileNavIcon.className = adjacentClasses;
        profileNavIcon.innerHTML = createNavIconHTML({ display: iconContent, tooltipText: `In ${clusterName}` });
        profileNavIcon.dataset.screenName = this.screenName;

        const POPUP_ID = `HiveExtension_Twitter_Popup_Profile_${this.screenName}`;

        // TODO: Replace this with attrs from the API once it gets added
        const authorImageURL = profileImageAnchor.getElementsByTagName('img')[0].src;

        const nameNode = document.getElementsByTagName('h2')[1];
        const name = nameNode.textContent;

        userData.avatarImage = authorImageURL;
        userData.name = name;

        await createHiveProfilePopup(
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
