import createHiveProfilePopup from '../HiveProfilePopup';
import { depthFirstNodeSearch, displayRank, displayScore, stringToHash } from './utils';
import { TOOLTIP_CLASSNAMES } from '../../../../config';

const USER_PREVIEW_SCORE_CLASS = 'HiveExtension_Twitter_ProfilePreview';

const createPreviewScoreIcon = ({ display = '', tooltipText = '' }) => `
<div class="${USER_PREVIEW_SCORE_CLASS} ${TOOLTIP_CLASSNAMES.TOOLTIP}">
    <span class="${USER_PREVIEW_SCORE_CLASS}-text">${display}</span>
    <span class="${TOOLTIP_CLASSNAMES.TEXT}">${tooltipText}</span>
</div>
`;

const BEE_ICON = `
    <svg viewBox="0 0 36 36" class="${USER_PREVIEW_SCORE_CLASS}-icon">
        <use xlink:href="#HiveExtension-icon-bee" />
    </svg>
`;

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

        const injectableIcon = this.createIcon(userData, ICON_ID);
        if (!injectableIcon) return;

        // Create popup
        const POPUP_ID = `HiveExtension-Twitter_UserPreview_Popup_${uniqueID}`;
        const authorImageAnchor = this.getAuthorImageAnchor(previewNode, screenName);
        const popupStyles = this.createPopupStyles(previewNode, authorImageAnchor);

        injectableIcon.style.width = `${authorImageAnchor.getBoundingClientRect().width}px`;

        await createHiveProfilePopup(this.settings, userData, injectableIcon, document.body, POPUP_ID, popupStyles);

        if (document.getElementById(ICON_ID)) return;
        const authorImageContainer = authorImageAnchor.parentNode;
        authorImageContainer.insertAdjacentElement('afterend', injectableIcon);
    }

    createIcon(userData, nodeId) {
        const { rank, score, clusterName } = userData;
        if (!rank && this.settings.shouldDisplayRank) {
            return;
        }

        const userScoreDisplay = document.createElement('div');
        userScoreDisplay.id = nodeId;
        userScoreDisplay.classList.add(`${USER_PREVIEW_SCORE_CLASS}-container`);

        let iconContent;
        if (rank && this.settings.shouldDisplayRank) {
            iconContent = `#${displayRank(rank)}`;
        } else if (this.settings.shouldDisplayScore) {
            iconContent = `[ ${displayScore(score)} ]`;
        } else if (this.settings.shouldDisplayIcon) {
            iconContent = BEE_ICON;
        } else {
            throw new Error(`Unrecognised displaySetting: "${this.settings.displaySetting}"`);
        }

        userScoreDisplay.innerHTML = createPreviewScoreIcon({ display: iconContent, tooltipText: `In ${clusterName}` });
        return userScoreDisplay;
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
