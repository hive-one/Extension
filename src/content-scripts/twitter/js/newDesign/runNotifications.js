import OnTweetsInjector from './OnTweetsInjector';

const runNotifications = async (settings, api) => {
    if (settings.showScoreOnTweets) {
        // Apart from how to find tweets on the page, everything else is the same as runHome
        const tweetElements = document.querySelectorAll('[data-testid=tweet]');

        const tInjector = new OnTweetsInjector(settings, api, tweetElements);
        await tInjector.run();
    }
};

export default runNotifications;
