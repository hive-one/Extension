import { h, Component } from 'preact';
import { TOOLTIP_CLASSNAMES, GA_TYPES } from '../../../../../config';

import createHiveProfilePopup from '../../HiveProfilePopup';

import { displayRank, displayScore } from '../../newDesign/utils';

const USER_PREVIEW_SCORE_CLASS = 'HiveExtension_Twitter_ProfilePreview';

export default class PreviewIcon extends Component {
    onClick = e => {
        e.preventDefault();
        e.stopPropagation();

        const ACTION_NAME = 'popup-opened-in-profile-preview';
        chrome.runtime.sendMessage({
            type: GA_TYPES.TRACK_EVENT,
            category: 'plugin-interactions',
            action: ACTION_NAME,
        });

        createHiveProfilePopup(
            this.props.settings,
            this.props.userData,
            document.body,
            this.props.POPUP_ID,
            this.props.popupStyles,
            true,
            this.props.clickableNode,
        );
    };

    onMouseEnter = e => {
        if (e.target) {
            const ACTION_NAME = 'rank/score-hovered-in-profile-preview';
            chrome.runtime.sendMessage({
                type: GA_TYPES.TRACK_EVENT,
                category: 'plugin-interactions',
                action: ACTION_NAME,
            });
        }
    };

    constructor(props) {
        super(props);
    }

    render() {
        const { rank, score, clusterName } = this.props.userData;
        let display;

        if (this.props.settings.shouldDisplayRank) {
            if (rank) {
                display = `#${displayRank(rank)}`;
            } else if (score) {
                display = `[ ${displayScore(score)} ]`;
            }
        } else if (this.props.settings.shouldDisplayScore) {
            if (score) {
                display = `[ ${displayScore(score)} ]`;
            }
        } else if (this.props.settings.shouldDisplayIcon) {
            display = (
                <svg viewBox="0 0 36 36" className={`${USER_PREVIEW_SCORE_CLASS}-icon`}>
                    <use href="#HiveExtension-icon-bee" />
                </svg>
            );
        } else {
            throw new Error(`Unrecognised displaySetting: "${this.props.settings.displaySetting}"`);
        }

        return (
            <div
                className={`${USER_PREVIEW_SCORE_CLASS} ${TOOLTIP_CLASSNAMES.TOOLTIP}`}
                onClick={this.onClick}
                onMouseEnter={this.onMouseEnter}
            >
                <span className={`${USER_PREVIEW_SCORE_CLASS}-text`}>{display}</span>
                <span className={`${TOOLTIP_CLASSNAMES.TEXT}`}>{clusterName}</span>
            </div>
        );
    }
}
