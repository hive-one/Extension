import '../../styles/twitter.scss';
import { TwitterProfileScoreExtension } from './ProfileScore';
import { TwitterTweetsAuthorScoreExtension } from './TweetsAuthorScore';
import { ExtensionIcons } from './Icons';
import { TwitterProfileHoverPopupScoreExtension } from './ProfileHoverPopupScore';

const runOldDesign = (settings, api) => {
    const observeDOM = (() => {
        const MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
            eventListenerSupported = window.addEventListener;

        return (element, callback) => {
            if (MutationObserver) {
                const observer = new MutationObserver(mutations => {
                    if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
                        callback();
                    }
                });

                observer.observe(element, { childList: true, subtree: true });
            } else if (eventListenerSupported) {
                element.addEventListener('DOMNodeInserted', callback, false);
                element.addEventListener('DOMNodeRemoved', callback, false);
            }
        };
    })();

    (async () => {
        const twitterProfileScore = new TwitterProfileScoreExtension(api, settings);
        const twitterTweetsAuthorScoreExtension = new TwitterTweetsAuthorScoreExtension(api, settings);
        const profileHoverPopupScore = new TwitterProfileHoverPopupScoreExtension(api, settings);
        const icons = new ExtensionIcons();

        const showScoreOnTweets = await settings.getOptionValue('showScoreOnTweets');

        function updatePrimaryColor() {
            const TEST_ELEMENT_ID = 'HiveExtension--test--anchor';

            let testElement = document.getElementById(TEST_ELEMENT_ID);

            if (!testElement) {
                testElement = document.createElement('a');
                testElement.id = TEST_ELEMENT_ID;
                testElement.style.display = 'none';
                document.head.appendChild(testElement);
            }

            const color = window.getComputedStyle(testElement).color;

            document.querySelector(':root').style.setProperty('--primary-color', color);
        }

        async function runExtensions() {
            icons.initialize();
            updatePrimaryColor();

            await twitterProfileScore.start();

            if (showScoreOnTweets) {
                await twitterTweetsAuthorScoreExtension.start();
            }

            await profileHoverPopupScore.start();
        }

        observeDOM(document.getElementsByTagName('body')[0], runExtensions);
    })();
};
export default runOldDesign;
