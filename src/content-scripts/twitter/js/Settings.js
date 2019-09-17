import { DISPLAY_TYPES } from '../../../config';

class ExtensionSettings {
    isNewTwitterDesign;
    constructor() {
        this.isNewTwitterDesign = this.getIsNewTwitterDesign();
        return new Promise(async resolve => {
            this.clusterToDisplay = await this.getOptionValue('clusterToDisplay');
            this.showScoreOnTweets = await this.getOptionValue('showScoreOnTweets');
            this.displaySetting = await this.getOptionValue('displaySetting');
            resolve(this);
        });
    }

    get isDarkTheme() {
        return Boolean(document.querySelector('.js-nightmode-icon.Icon--crescentFilled'));
    }

    get shouldDisplayRank() {
        return [DISPLAY_TYPES.RANKS, DISPLAY_TYPES.RANKS_WITH_SCORES_FALLBACK].includes(this.displaySetting);
    }

    get shouldDisplayScore() {
        return [DISPLAY_TYPES.SCORES, DISPLAY_TYPES.RANKS_WITH_SCORES_FALLBACK].includes(this.displaySetting);
    }

    get shouldDisplayIcon() {
        return DISPLAY_TYPES.ICONS === this.displaySetting;
    }

    getIsNewTwitterDesign() {
        return !!document.getElementById('react-root');
    }

    getOptionValue(name) {
        return new Promise(resolve => {
            chrome.storage.sync.get([name], result => resolve(result[name]));
        });
    }
}

export default ExtensionSettings;
