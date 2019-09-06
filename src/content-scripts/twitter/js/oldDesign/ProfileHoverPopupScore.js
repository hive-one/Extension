import { ProfilePopup } from './ProfilePopup';

const PROFILE_HOVER_CONTAINER = '#profile-hover-container';
const ELEMENT_CLASS = 'HiveExtension-Twitter_profile-hover-popup';

export class TwitterProfileHoverPopupScoreExtension {
    _api;
    _settings;

    constructor(api, settings) {
        this._api = api;
        this._settings = settings;
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
        if (!this.shouldRun()) {
            return;
        }

        const userTwitterId = this.getUserId();

        if (!userTwitterId) {
            return;
        }

        const {
            score: defaultClusterScore,
            name: defaultClusterName,
            rank: defaultClusterRank,
            indexed: accountIndexed,
        } = await this._api.getTwitterUserScoreById(userTwitterId);

        this.displayUserScore(defaultClusterScore, defaultClusterRank, defaultClusterName, accountIndexed);
    }

    async displayUserScore(defaultClusterScore, defaultClusterRank, defaultClusterName, accountIndexed) {
        if (!accountIndexed) {
            return;
        }

        let tooltip = '';
        let label = '';
        let value = '';

        const option = await this._settings.getOptionValue('displaySetting');

        if (['showRanksWithScoreFallback', 'showRanks'].includes(option) && defaultClusterRank) {
            value = `${defaultClusterRank}`;
            label = `${defaultClusterName} Rank`;
            tooltip = `${defaultClusterName} Rank ${defaultClusterRank}`;
        } else if (option !== 'showRanks') {
            label = `${defaultClusterName} Score`;
            value = Math.round(defaultClusterScore);
            tooltip = `${defaultClusterName} Score ${value}`;
        }

        const displayElement = document.createElement('li');
        displayElement.classList.add('ProfileCardStats-stat');
        displayElement.classList.add('Arrange-sizeFit');
        displayElement.classList.add(ELEMENT_CLASS);

        displayElement.innerHTML = `
          <div class="ProfileCardStats-statLink u-textUserColor u-linkClean u-block js-nav js-tooltip" data-original-title="${tooltip}">
            <span class="ProfileCardStats-statLabel u-block" style="width: 76px">${label}</span>
            <span class="ProfileCardStats-statValue" style="text-align: center;" data-count="${value}" data-is-compact="false">${value}</span>
          </div>
        `;

        if (label) {
            const popup = new ProfilePopup(this.getUserId(), this._api, this._settings);
            popup.showOnClick(displayElement);
        } else {
            displayElement.style.display = 'none';
        }

        const statList = document.querySelector(`${PROFILE_HOVER_CONTAINER} .ProfileCardStats-statList`);

        if (statList && this.shouldRun()) {
            statList.prepend(displayElement);
        }
    }
}
