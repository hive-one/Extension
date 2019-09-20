import ExtensionSettings from '../content-scripts/twitter/js/Settings';
import HiveAPI from '../content-scripts/twitter/js/HiveAPI';
import { CONFIG } from '../config';
import './popup.scss';

const SETTINGS_SELECTS = [
    ['#cluster-options-select', 'clusterToDisplay'],
    ['#display-settings-select', 'displaySetting'],
    ['#top-followers-cluster-select', 'topFollowersCluster'],
];

SETTINGS_SELECTS.forEach(([selector, name]) => {
    const element = document.querySelector(selector);

    chrome.storage.sync.get([name], result => {
        element.querySelector(`option[value="${result[name]}"]`).selected = true;
    });

    element.addEventListener('change', event => {
        const newValue = event.target.value;

        chrome.storage.sync.set({
            [name]: newValue,
        });
    });
});

const SCORE_ON_TWEETS_CHECKBOX = document.querySelector('#show-score-on-tweets');

chrome.storage.sync.get(['showScoreOnTweets'], result => {
    SCORE_ON_TWEETS_CHECKBOX.checked = result.showScoreOnTweets;
});

SCORE_ON_TWEETS_CHECKBOX.addEventListener('click', event => {
    chrome.storage.sync.set({
        showScoreOnTweets: event.target.checked,
    });
});

(async () => {
    const settings = await new ExtensionSettings();
    const api = await new HiveAPI(CONFIG.API_HOST);

    if (!(await settings.getOptionValue('subscribedToNewsletter'))) {
        document.querySelector('#newsletter-option').style.display = 'block';

        document.querySelector('#newsletter-subscribe').addEventListener('click', async () => {
            try {
                api.fetchInBackgroundContext(
                    `https://top.us16.list-manage.com/subscribe/post-json?u=ceb4e009307c8f47c4d2ddfb2&amp;id=dd29d770c2&EMAIL=${
                        document.querySelector('#newsletter-email').value
                    }`,
                );
            } catch (error) {
                console.log('error', error);
            }

            document.querySelector('#newsletter-option').innerHTML =
                '<b>We need to confirm your email address. To complete the subscription process, please click the link in the email we just sent you.</b>';

            chrome.storage.sync.set({
                subscribedToNewsletter: true,
            });
        });
    }
})();
