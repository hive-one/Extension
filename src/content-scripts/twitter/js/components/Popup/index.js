import { h, Component } from 'preact';

import { GA_TYPES } from '../../../../../config';

import { CONFIG } from '../../../../../config';

const POPUP_CLASS = 'HiveExtension-Twitter_popup-profile';

class HivePopupContent extends Component {
    returnTabActive = tabName => {
        if (tabName === this.state.openTab) {
            return 'HiveExtension-Twitter_popup-profile_tab_active';
        }
        return '';
    };

    changeOpenTab = tabName => {
        this.setState({ openTab: tabName });
        const ACTION_NAME = `popup-clicked-${tabName}-tab`;
        chrome.runtime.sendMessage({
            type: GA_TYPES.TRACK_EVENT,
            category: 'plugin-interactions',
            action: ACTION_NAME,
        });
    };

    constructor(props) {
        super(props);
        this.state = {
            openTab: 'scores',
        };
    }

    renderPodcastsTab = () => {
        return '';
    };

    renderScores = () => {
        let { scores } = this.props.userData;
        return scores.map((item, index) => {
            const roundedScore = Math.round(item.score);
            const percentage = Math.floor((roundedScore / CONFIG.MAX_SCORE) * 100);
            return (
                <div key={index} className={`${POPUP_CLASS}_cluster-score`}>
                    <div className={`${POPUP_CLASS}_cluster-score_left`}>{item.name}</div>
                    <div className={`${POPUP_CLASS}_cluster-score_right`}>
                        <span className={`${POPUP_CLASS}_cluster-score_right_bold`}>{roundedScore}</span>
                        <span className={`${POPUP_CLASS}_cluster-score_right_small`}>/ 1000</span>
                    </div>
                    <div className={`${POPUP_CLASS}_cluster-score_progress-bar`}>
                        <div className={`${POPUP_CLASS}_cluster-score_progress-bar_bg`} />
                        <div
                            className={`${POPUP_CLASS}_cluster-score_progress-bar_progress`}
                            style={`width:${percentage}%`}
                        />
                    </div>
                </div>
            );
        });
    };

    renderFollowers = () => {
        if (this.props.userData.followers) {
            let { followers } = this.props.userData;
            return followers.map((item, index) => {
                return (
                    <a
                        key={index}
                        href={`https://twitter.com/${item.screenName}`}
                        className={`${POPUP_CLASS}_followers_follower`}
                    >
                        <span className={`${POPUP_CLASS}_followers_follower_score`}>{item.rank ? item.rank : ''}</span>
                        <div className={`${POPUP_CLASS}_followers_follower_user`}>
                            <img className={`${POPUP_CLASS}_followers_follower_user_avatar`} src={item.imageUrl} />
                            <div className={`${POPUP_CLASS}_followers_follower_user_info`}>
                                <span className={`${POPUP_CLASS}_followers_follower_user_info_name`}>{item.name}</span>
                                <span className={`${POPUP_CLASS}_followers_follower_user_info_screen_name`}>
                                    @{item.screenName}
                                </span>
                            </div>
                        </div>
                        <span className={`${POPUP_CLASS}_followers_follower_rank`}>{item.score.toFixed(0)}</span>
                    </a>
                );
            });
        }
    };

    renderPodcasts = () => {
        return '';
    };

    render() {
        const scoresTabActiveClass = this.returnTabActive('scores');
        const followersTabActiveClass = this.returnTabActive('followers');
        // eslint-disable-next-line no-unused-vars
        const podcastsTabActiveClass = this.returnTabActive('podcasts');

        const activateScoresTab = () => this.changeOpenTab('scores');
        const activateFollowersTab = () => this.changeOpenTab('followers');
        // eslint-disable-next-line no-unused-vars
        const activatePodcastsTab = () => this.changeOpenTab('podcasts');

        return (
            <div>
                {!this.props.disableUserInfo && (
                    <div className={`${POPUP_CLASS}_user_info_avatar`}>
                        <img src={this.props.userData.imageUrl} />
                    </div>
                )}
                {!this.props.disableUserInfo && (
                    <a
                        href={`https://twitter.com/${this.props.userData.screenName}`}
                        className={`${POPUP_CLASS}_user_info`}
                    >
                        <span className={`${POPUP_CLASS}_user_info_name`}>{this.props.userData.userName}</span>
                        <span className={`${POPUP_CLASS}_user_info_screen_name`}>
                            @{this.props.userData.screenName}
                        </span>
                    </a>
                )}
                <br />
                <div className={`${POPUP_CLASS}_tabs`}>
                    <div
                        id="scores_tab_btn"
                        className={`${POPUP_CLASS}_tab ${scoresTabActiveClass}`}
                        onClick={activateScoresTab}
                    >
                        <span>Scores</span>
                    </div>
                    {this.props.userData.followers && (
                        <div
                            id="followers_tab_btn"
                            className={`${POPUP_CLASS}_tab ${followersTabActiveClass}`}
                            onClick={activateFollowersTab}
                        >
                            <span>Top Followers</span>
                        </div>
                    )}
                    {this.renderPodcastsTab()}
                </div>
                <br />
                <div
                    id="popup_scores"
                    className={`${POPUP_CLASS}_content`}
                    style={`display:${this.state.openTab === 'scores' ? 'block' : 'none'}`}
                >
                    {this.renderScores()}
                    <br />
                </div>
                <div
                    id="popup_followers"
                    className={`${POPUP_CLASS}_followers`}
                    style={`display:${this.state.openTab === 'followers' ? 'block' : 'none'}`}
                >
                    {this.renderFollowers()}
                    <br />
                </div>
                <div id="popup_podcasts">{this.renderPodcasts()}</div>
                <br />
                <div className={`${POPUP_CLASS}_credit`}>
                    <svg viewBox="0 0 36 36" className={`${POPUP_CLASS}_credit_icon`}>
                        <use href="#HiveExtension-icon-bee" />
                    </svg>
                    <a
                        href={`https://hive.one/p/${this.props.userData.screenName}?ref=hive-extension`}
                        target="__blank"
                    >
                        Learn more about this profile at hive.one
                    </a>
                </div>
            </div>
        );
    }
}

class HivePopup extends Component {
    checkIfPopupSitsInsideWindow = () => {
        function sitsInsideWindowWidth(childNode) {
            let childRect = childNode.getBoundingClientRect();

            return window.innerWidth >= childRect.right;
        }

        function sitsInsideWindowHeight(childNode) {
            let childRect = childNode.getBoundingClientRect();

            return window.innerHeight >= childRect.bottom;
        }

        // TODO: Make this work again
        // if (this.props.profilePreview && this.props.clickableNode) {
        //     let { top } = this.props.clickableNode.getBoundingClientRect();
        //     let style = { ...this.state.style };
        //     console.log(style.top);
        //     style.top = `${top + window.scrollY}px`;
        //     console.log(style.top);
        //     this.setState({ style });
        // }

        if (!sitsInsideWindowWidth(this.popupElem)) {
            let style = { ...this.state.style };
            style.left = 'auto';
            this.setState({ style });
        }

        if (!sitsInsideWindowHeight(this.popupElem)) {
            let { height } = this.popupElem.getBoundingClientRect();
            let style = { ...this.state.style };
            style.top = `${parseFloat(this.popupElem.style.top) - height - 40}px`;
            this.setState({ style });
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            style: { ...this.props.popupStyles },
        };
    }

    componentDidMount() {
        this.checkIfPopupSitsInsideWindow();
    }

    render() {
        return (
            <div
                className={`HiveExtension-Twitter_popup-profile ${
                    this.props.settings.isDarkTheme() ? 'HiveExtension-Twitter_popup-profile-dark' : ''
                }`}
                style={this.state.style}
                ref={elem => (this.popupElem = elem)}
            >
                <HivePopupContent {...this.props} />
            </div>
        );
    }
}

const HiveInjectedPopup = props => {
    props.disableUserInfo = true;
    return (
        <div
            className={`HiveExtension-Twitter_popup-profile-injection ${
                props.settings.isDarkTheme() ? 'HiveExtension-Twitter_popup-profile-dark' : ''
            }`}
        >
            <HivePopupContent {...props} />
        </div>
    );
};

export { HivePopup, HiveInjectedPopup };
