import { displayRank, displayScore } from '../newDesign/utils';

export const displayRankOrScore = (rank, score, settings) => {
    let content;

    if (settings.shouldDisplayRank) {
        if (rank) {
            content = `#${displayRank(rank)}`;
        } else if (score) {
            content = `[ ${displayScore(score)} ]`;
        }
    } else if (settings.shouldDisplayScore) {
        if (score) {
            content = `[ ${displayScore(score)} ]`;
        }
    } else if (settings.shouldDisplayIcon) {
        content = '';
    } else {
        throw new Error(`Unrecognised displaySetting: "${settings.displaySetting}"`);
    }

    return content;
};
