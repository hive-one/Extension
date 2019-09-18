import createHiveProfilePopup from '../HiveProfilePopup';
import { displayScore } from '../newDesign/utils';

const PROFILE_HOVER_CONTAINER = '#profile-hover-container';
const ELEMENT_CLASS = 'HiveExtension-Twitter_profile-hover-popup';

const BEE_ICON = `
    <svg style='height: 17px; display: block; margin: auto' viewBox="0 0 36 36">
        <use xlink:href="#hive-icon" />
    </svg>
`;

export class TwitterProfileHoverPopupScoreExtension {
    api;
    settings;

    constructor(_api, _settings) {
        this.api = _api;
        this.settings = _settings;
    }

    getUserId() {
        const container = document.querySelector(PROFILE_HOVER_CONTAINER);

        if (container) {
            return container.getAttribute('data-user-id');
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

        const userTwitterId = this.getUserId();

        if (!userTwitterId) return;
        if (!this.api.isIdentifierIndexed(userTwitterId)) return;

        const userData = await this.api.getFilteredTwitterUserData(userTwitterId);
        if (!userData) return;

        const { screenName, score, clusterName, rank } = userData;

        let tooltip = '';
        let label = '';
        let value = '';
        let icon = '';

        if (rank && this.settings.shouldDisplayRank) {
            value = rank;
            label = `${clusterName} Rank`;
            tooltip = `${clusterName} Rank ${rank}`;
        } else if (this.settings.shouldDisplayScore) {
            label = `${clusterName} Score`;
            value = displayScore(score);
            tooltip = `${clusterName} Score ${value}`;
        } else if (this.settings.shouldDisplayIcon) {
            label = `${clusterName}`;
            icon = BEE_ICON;
        }

        const displayElement = document.createElement('li');
        displayElement.classList.add('ProfileCardStats-stat');
        displayElement.classList.add('Arrange-sizeFit');
        displayElement.classList.add(ELEMENT_CLASS);

        displayElement.innerHTML = `
          <div class="ProfileCardStats-statLink u-textUserColor u-linkClean u-block js-nav js-tooltip" data-original-title="${tooltip}">
            <span class="ProfileCardStats-statLabel u-block" style="width: 76px; text-align: center;">${label}</span>
            <span class="ProfileCardStats-statValue">${icon}</span>
            <span class="ProfileCardStats-statValue" style="text-align: center;" data-count="${value}" data-is-compact="false">${value}</span>
          </div>
        `;

        const POPUP_ID = `HiveExtension_Twitter_Popup_YouMayLike_${screenName}`;
        await createHiveProfilePopup(this.settings, userData, displayElement, displayElement, POPUP_ID, {});

        const statList = document.querySelector(`${PROFILE_HOVER_CONTAINER} .ProfileCardStats-statList`);

        if (statList && this.shouldRun()) {
            statList.prepend(displayElement);
        }
    }
}
