import OnProfileInjector from './OnProfileInjector';
import OnTweetsInjector from './OnTweetsInjector';
import { sleep } from './utils';

const runProfile = async (settings, api, screenName) => {
    const pInjector = new OnProfileInjector(settings, api, screenName);
    await pInjector.run();

    if (settings.showScoreOnTweets) {
        const tInjector = new OnTweetsInjector(settings, api);
        await tInjector.run();
    }

    // loop
    await sleep(2000);
    runProfile(settings, api, screenName);
};

export default runProfile;
