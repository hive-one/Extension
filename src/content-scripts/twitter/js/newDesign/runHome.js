import OnTweetsInjector from './OnTweetsInjector';
import { sleep } from './utils';

const runHome = async (settings, api) => {
    if (settings.showScoreOnTweets) {
        const tInjector = new OnTweetsInjector(settings, api);
        await tInjector.run();

        // loop
        await sleep(2000);
        runHome(settings, api);
    }
};

export default runHome;
