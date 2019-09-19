import OnTweetsInjector from './OnTweetsInjector';

const runNotifications = async (settings, api) => {
    if (settings.showScoreOnTweets) {
        const tweetElements = document.querySelectorAll('[data-testid=tweet]');

        const tInjector = new OnTweetsInjector(settings, api, tweetElements);
        await tInjector.run();
    }
};

export default runNotifications;
