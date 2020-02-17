import { depthFirstNodeSearch, stringToHash } from './utils';

import { h, render } from 'preact';

import PreviewIcon from '../components/PreviewIcon';

export default class {
    settings;
    api;
    constructor(_settings, _api) {
        this.settings = _settings;
        this.api = _api;
    }

    async run() {
        let profilePreviews = document.querySelectorAll('[data-testid=UserCell]');

        if (!profilePreviews || !profilePreviews.length) {
            return;
        }

        for (let i = 0; i < profilePreviews.length; i++) {
            const profileNode = profilePreviews[i];
            const testCondition = node => node.tagName === 'A';
            const imageAnchor = depthFirstNodeSearch(profileNode, testCondition);
            if (imageAnchor) {
                let screenName = imageAnchor.href.slice(20);
                // Create's a unique ID based on the element as sometimes the same profile might appear on the same page but will have different classnames
                let hashableString = screenName + profileNode.parentNode.parentNode.className;
                this.injectOntoProfilePreview(profileNode, screenName, stringToHash(hashableString));
            }
        }
    }

    async injectOntoProfilePreview(previewNode, screenName, uniqueID) {
        if (!this.api.isIdentifierIndexed(screenName)) return;

        const ICON_ID = `HiveExtension-Twitter_user_preview-score_${uniqueID}`;
        if (document.getElementById(ICON_ID)) return;

        const authorImageAnchor = this.getAuthorImageAnchor(previewNode, screenName);

        const userData = await this.api.getFilteredTwitterUserData(screenName);
        if (!userData) {
            throw new Error(`Failed getting user data for user @${screenName}`);
        }

        // const injectableIcon = this.createIcon(userData, ICON_ID);
        const injectableIcon = document.createElement('div');
        injectableIcon.id = ICON_ID;
        if (!injectableIcon) return;

        // Create popup
        const POPUP_ID = `HiveExtension-Twitter_UserPreview_Popup_${uniqueID}`;

        const popupStyles = this.createPopupStyles(previewNode, authorImageAnchor);

        if (document.getElementById(ICON_ID)) return;
        const authorImageContainer = authorImageAnchor.parentNode;
        authorImageContainer.insertAdjacentElement('afterend', injectableIcon);

        let props = {
            userData,
            settings: this.settings,
            uniqueID,
            POPUP_ID,
            popupStyles,
            clickableNode: injectableIcon,
            getNewStylesFunc: () => this.createPopupStyles(previewNode, authorImageAnchor),
        };

        render(<PreviewIcon {...props} />, injectableIcon);
    }

    createPopupStyles(preivewNode, authorImageAnchor) {
        // Twitters new design contains numerous instances of z-index: 0 not
        // only on every element, but several children nodes within the element.
        // This constant creation of new stacking contexts requires ugly hacky
        // solutions to display our popup.
        const authorImageRect = authorImageAnchor.getBoundingClientRect();

        const previewRect = preivewNode.getBoundingClientRect();
        const left = previewRect.left + 'px';
        const top = authorImageRect.top + window.pageYOffset + 80 + 'px';
        return { top, left };
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
