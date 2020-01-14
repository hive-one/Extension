import { h, Component } from 'preact';
import createHiveProfilePopup from '../../HiveProfilePopup';

import { displayRank, displayScore } from '../../newDesign/utils';
import { TOOLTIP_CLASSNAMES, GA_TYPES } from '../../../../../config';

const BEE_ICON = `
    <svg viewBox="0 0 36 36" class="${PROILE_NAV_ICON_ID}-icon">
        <use xlink:href="#HiveExtension-icon-bee" />
    </svg>
`;

const PROILE_NAV_ICON_ID = 'HiveExtension_Twitter_ProfileNav';

export default class HeaderIcon extends Component {
    onMouseEnter = e => {
        if (e.target) {
            const ACTION_NAME = 'rank/score-hovered-in-profile-header';
            chrome.runtime.sendMessage({
                type: GA_TYPES.TRACK_EVENT,
                category: 'plugin-interactions',
                action: ACTION_NAME,
            });
        }
    };

    onClick = e => {
        e.preventDefault();
        e.stopPropagation();
        const ACTION_NAME = 'popup-opened-in-profile-header';
        chrome.runtime.sendMessage({
            type: GA_TYPES.TRACK_EVENT,
            category: 'plugin-interactions',
            action: ACTION_NAME,
        });

        // Get podcasts data
        // const podcastData = await this.api._requestUserPodcastData(this.screenName);
        // console.log('PODCAST DATA', podcastData);
        // var event = new CustomEvent('customEvent', {
        //     detail: {
        //         podcast: podcastData
        //     }
        // });
        // profileNavIcon.dispatchEvent(event);

        const POPUP_ID = `HiveExtension_Twitter_Popup_Profile_${this.props.screenName}`;
        let styles = { top: '254px', right: 0 };
        createHiveProfilePopup(
            this.props.settings,
            this.props.userData,
            this.props.popupAppendableNode,
            POPUP_ID,
            styles,
        );
    };

    constructor(props) {
        super(props);
    }

    render() {
        const { rank, score, clusterName } = this.props.userData;
        let iconContent;

        if (this.props.settings.shouldDisplayRank) {
            if (rank) {
                iconContent = `#${displayRank(rank)}`;
            } else if (score) {
                iconContent = `[ ${displayScore(score)} ]`;
            }
        } else if (this.props.settings.shouldDisplayScore) {
            if (score) {
                iconContent = `[ ${displayScore(score)} ]`;
            }
        } else if (this.props.settings.shouldDisplayIcon) {
            iconContent = BEE_ICON;
        }

        const darkTheme = () => {
            if (this.props.settings.isDarkTheme()) {
                return 'HiveExtension_Twitter_ProfileNav_dark';
            }
        };

        return (
            <div
                className={`${TOOLTIP_CLASSNAMES.TOOLTIP} HiveExtension_Twitter_ProfileNav-container ${
                    this.props.adjacentClasses
                } ${darkTheme()}`}
                onMouseEnter={this.onMouseEnter}
                onClick={this.onClick}
            >
                <span className={'HiveExtension_Twitter_ProfileNav-display'}>{iconContent}</span>
                <span className={`${TOOLTIP_CLASSNAMES.TEXT} ${TOOLTIP_CLASSNAMES.TEXT}_profile`}>
                    in {clusterName}
                </span>
            </div>
        );
    }
}
