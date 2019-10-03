import createHiveHoverInjectedProfile from '../HiveProfileHoverInjector';
import { depthFirstNodeSearch, stringToHash } from './utils';

export default class {
    settings;
    api;
    constructor(_settings, _api) {
        this.settings = _settings;
        this.api = _api;
    }

    async run() {
        let profilePopups = document.querySelectorAll('div[style*="will-change: opacity, height"]');

        if (!profilePopups || !profilePopups.length) {
            throw new Error('Failed finding profile previews');
        }

        for (let i = 0; i < profilePopups.length; i++) {
            const profilePopupNode = profilePopups[i];
            const testCondition = node => node.tagName === 'A';
            const imageAnchor = depthFirstNodeSearch(profilePopupNode, testCondition);
            if (imageAnchor) {
                let screenName = imageAnchor.href.slice(20);
                // Create's a unique ID based on the element as sometimes the same profile might appear on the same page but will have different classnames
                let hashableString = screenName + profilePopupNode.parentNode.parentNode.className;
                await this.injectOntoProfilePreview(profilePopupNode, screenName, stringToHash(hashableString));
            }
        }
    }

    async injectOntoProfilePreview(previewNode, screenName, uniqueID) {
        if (!this.api.isIdentifierIndexed(screenName)) return;

        const ICON_ID = `HiveExtension-Twitter_user_preview-score_${uniqueID}`;
        if (document.getElementById(ICON_ID)) return;

        const userData = await this.api.getFilteredTwitterUserData(screenName);
        if (!userData) {
            throw new Error(`Failed getting user data for user @${screenName}`);
        }

        // Create popup
        const POPUP_ID = `HiveExtension-Twitter_UserPreview_Popup_${uniqueID}`;
        const authorImageAnchor = this.getAuthorImageAnchor(previewNode, screenName);

        // Inject some content at the end of the popup

        await createHiveHoverInjectedProfile(
            this.settings,
            userData,
            authorImageAnchor.parentNode.parentNode,
            POPUP_ID,
        );
    }

    getAuthorImageAnchor(previewNode, screenName) {
        // crawls the children nodes of the preview for the anchor tag that
        // wraps the preview profile image
        const HREF = `https://twitter.com/${screenName}`;
        const testCondition = node => node.tagName === 'A' && node.href === HREF;
        const authorImageAnchor = depthFirstNodeSearch(previewNode, testCondition);
        if (!authorImageAnchor) {
            throw new Error(`Failed finding preview image tag: @${screenName}`);
        }

        return authorImageAnchor;
    }
}
