import OnTweetsInjector from './OnTweetsInjector';

const runHome = async (settings, api) => {
    if (settings.showScoreOnTweets) {
        const tInjector = new OnTweetsInjector(settings, api);
        await tInjector.run();
    }
};

export default runHome;
