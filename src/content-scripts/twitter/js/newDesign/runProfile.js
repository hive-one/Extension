import OnProfileInjector from './OnProfileInjector';
import OnTweetsInjector from './OnTweetsInjector';

const runProfile = async (settings, api, screenName) => {
    const pInjector = new OnProfileInjector(settings, api, screenName);
    await pInjector.run();

    if (settings.showScoreOnTweets) {
        const tInjector = new OnTweetsInjector(settings, api);
        await tInjector.run();
    }
};

export default runProfile;
