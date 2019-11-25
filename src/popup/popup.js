// import ExtensionSettings from '../content-scripts/twitter/js/Settings';
// import HiveAPI from '../content-scripts/twitter/js/HiveAPI';
// import { CONFIG } from '../config';
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
    // const settings = await new ExtensionSettings();
    // const api = await new HiveAPI(CONFIG.API_HOST);

    if (location.hash === '#permissions') {
        document.getElementById('permissions').style.display = 'block';
        document.body.classList.add('permissions-page');

        document.getElementById('privacy-policy-cta-agree').addEventListener('click', () => {
            chrome.storage.sync.set({
                'HiveExtension:acceptedPermissions': true,
            });
            document.getElementById('permissions-accept-or-deny').style.display = 'none';
            document.getElementById('permissions-accepted').style.display = 'flex';
        });

        document.getElementById('privacy-policy-cta-deny').addEventListener('click', () => {
            chrome.storage.sync.set({
                'HiveExtension:acceptedPermissions': false,
            });
            document.getElementById('permissions-accept-or-deny').style.display = 'none';
            document.getElementById('permissions-denied').style.display = 'flex';
        });

        document.querySelectorAll('button[data-id="privacy-policy-continue-with-tutorial"]').forEach(node => {
            node.addEventListener('click', () => {
                document.getElementById('permissions-accepted').style.display = 'none';
                document.getElementById('permissions-denied').style.display = 'none';

                document.getElementById('permissions-tutorial-score').style.display = 'flex';
                // document.querySelector('div[class="HiveExtension-permissions-window"]').classList.add('HiveExtension-permissions-window-tutorial');
            });
        });

        document.getElementById('privacy-policy-continue-to-profile').addEventListener('click', () => {
            document.getElementById('permissions-tutorial-score').style.display = 'none';

            document.getElementById('permissions-tutorial-profile').style.display = 'flex';
            // document.querySelector('div[class="HiveExtension-permissions-window"]').classList.add('HiveExtension-permissions-window-tutorial');
        });

        document.getElementById('privacy-policy-continue-to-hover').addEventListener('click', () => {
            document.getElementById('permissions-tutorial-profile').style.display = 'none';

            document.getElementById('permissions-tutorial-hover').style.display = 'flex';
            // document.querySelector('div[class="HiveExtension-permissions-window"]').classList.add('HiveExtension-permissions-window-tutorial');
        });

        document.getElementById('privacy-policy-finish').addEventListener('click', () => {
            window.location.replace('https://twitter.com');
        });
    } else {
        document.getElementById('popup').style.display = 'block';
    }

    // if (!(await settings.getOptionValue('subscribedToNewsletter'))) {
    //     document.querySelector('#newsletter-option').style.display = 'block';

    //     document.querySelector('#newsletter-subscribe').addEventListener('click', async () => {
    //         try {
    //             api.fetchInBackgroundContext(
    //                 `https://top.us16.list-manage.com/subscribe/post-json?u=ceb4e009307c8f47c4d2ddfb2&amp;id=dd29d770c2&EMAIL=${
    //                     document.querySelector('#newsletter-email').value
    //                 }`,
    //             );
    //         } catch (error) {
    //             console.log('error', error);
    //         }

    //         document.querySelector('#newsletter-option').innerHTML =
    //             '<b>We need to confirm your email address. To complete the subscription process, please click the link in the email we just sent you.</b>';

    //         chrome.storage.sync.set({
    //             subscribedToNewsletter: true,
    //         });
    //     });
    // }
})();
