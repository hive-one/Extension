import TweetAuthorScores from './TweetAuthorScores';
import { sleep } from './utils';

const runHome = async (settings, api) => {
    if (settings.showScoreOnTweets) {
        const tweetScores = new TweetAuthorScores(settings, api);
        await tweetScores.run();
    }

    // loop
    await sleep(2000);
    runHome(settings, api);
};

export default runHome;
