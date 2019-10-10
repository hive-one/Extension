import createHiveHoverPopupProfile from '../HiveHoverPopupProfile';

const PROFILE_HOVER_CONTAINER = '#profile-hover-container';
const ELEMENT_CLASS = 'HiveExtension-Twitter_profile-hover-popup';

export class TwitterProfileHoverPopupScoreExtension {
    api;
    settings;

    constructor(_api, _settings) {
        this.api = _api;
        this.settings = _settings;
    }

    getUserScreenName() {
        const container = document.querySelector(PROFILE_HOVER_CONTAINER);

        if (container) {
            return container.getAttribute('data-screen-name');
        }
    }

    shouldRun() {
        const container = document.querySelector(PROFILE_HOVER_CONTAINER);

        return container && !container.querySelector(`.${ELEMENT_CLASS}`) && container.style.display !== 'none';
    }

    async start() {
        // This runs on the profile popup that twitter creates
        // within the 'You may also like' section
        if (!this.shouldRun()) {
            return;
        }

        const userScreenName = this.getUserScreenName();

        if (!userScreenName) return;
        if (!this.api.isIdentifierIndexed(userScreenName)) return;

        const userData = await this.api.getFilteredTwitterUserData(userScreenName);
        if (!userData) return;

        const { screenName } = userData;

        const POPUP_ID = `HiveExtension_Twitter_Popup_YouMayLike_${screenName}`;

        const statList = document.querySelector(`${PROFILE_HOVER_CONTAINER} .ProfileCardStats-statList`);

        if (statList && this.shouldRun()) {
            await createHiveHoverPopupProfile(this.settings, userData, statList.parentNode.parentNode, POPUP_ID, {
                padding: '16px',
            });
        }
    }
}
