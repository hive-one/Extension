import OnTweetsInjector from './OnTweetsInjector';

const runNotifications = async (settings, api) => {
    if (settings.showScoreOnTweets) {
        const articleElements = document.getElementsByTagName('article');
        const tweetElements = [...articleElements].filter(item => {
            return item.firstElementChild.lastElementChild.hasAttribute('data-testid');
        });

        // tweetElements = document.querySelectorAll('[data-testid=UserCell]');

        const tInjector = new OnTweetsInjector(settings, api, tweetElements);
        await tInjector.run();
    }
};

export default runNotifications;
