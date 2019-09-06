class ExtensionSettings {
    isNewTwitterDesign;
    constructor() {
        this.isNewTwitterDesign = this.getIsNewTwitterDesign();
        return new Promise(async resolve => {
            this.clusterToDisplay = await this.getOptionValue('clusterToDisplay');
            resolve(this);
        });
    }

    get isDarkTheme() {
        return Boolean(document.querySelector('.js-nightmode-icon.Icon--crescentFilled'));
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
