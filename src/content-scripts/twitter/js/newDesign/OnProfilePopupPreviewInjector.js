import createHiveHoverPopupProfile from '../HiveHoverPopupProfile';
import { depthFirstNodeSearch, stringToHash, errorHandle } from './utils';

export default class {
    settings;
    api;
    constructor(_settings, _api) {
        this.settings = _settings;
        this.api = _api;
    }

    async run() {
        let profilePopups = document.getElementsByClassName('r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-184en5c');

        if (!profilePopups || !profilePopups.length) {
            return errorHandle('Failed finding profile previews');
        }

        for (let i = 0; i < profilePopups.length; i++) {
            const profilePopupNode = profilePopups[i];
            const testCondition = node => node.tagName === 'A';
            const imageAnchor = depthFirstNodeSearch(profilePopupNode, testCondition);
            if (imageAnchor) {
                let screenName = imageAnchor.href.slice(20);
                // Create's a unique ID based on the element as sometimes the same profile might appear on the same page but will have different classnames
                let hashableString = screenName + profilePopupNode.parentNode.parentNode.className;
                this.injectOntoProfilePreview(profilePopupNode, screenName, stringToHash(hashableString));
            }
        }
    }

    async injectOntoProfilePreview(previewNode, screenName, uniqueID) {
        // console.log("get this far");
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
        let parentNode = authorImageAnchor.parentNode.parentNode;
        const styles = {};
        let ownProfile = false;

        // Check to see if the popup is the "more" popup
        if (
            authorImageAnchor.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute(
                'role',
            ) === 'menu'
        ) {
            parentNode = authorImageAnchor.parentNode.parentNode.parentNode;
            styles.padding = '10px';
            ownProfile = true;
        }

        // Inject some content at the end of the popup
        await createHiveHoverPopupProfile(this.settings, userData, parentNode, POPUP_ID, styles, ownProfile);
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
