import runProfile from './runProfile';
import runHome from './runHome';
import { initialiseIcons, sleep } from './utils';

const skippableRoutes = /^\/(notifications|explore|messages|i\/|compose|settings|[A-Za-z0-9_]+\/lists)/;

const run = async (settings, api) => {
    const { pathname } = window.location;

    if (pathname === '/' || pathname.match(skippableRoutes)) {
        console.log(`TODO: Handle route: "${pathname}"`);
        return;
    } else if (pathname === '/home') {
        await runHome(settings, api);
    } else if (pathname.match(/^\/[A-Za-z0-9_]+\/status/)) {
        // at the moment there is no difference in how
        // the home route is handled and how threads are
        // handled
        await runHome(settings, api);
    } else if (pathname.match(/^\/[A-Za-z0-9_]+$/)) {
        const screenName = pathname.slice(1);
        await runProfile(settings, api, screenName);
    } else {
        throw new Error(`Unhandled route: ${pathname}`);
    }
};

const rerunOnUrlChange = async (oldUrl, rerun, oldRunningTask) => {
    await sleep(1000);

    let newUrl = window.location.href;
    if (oldUrl === newUrl) {
        rerunOnUrlChange(newUrl, rerun, oldRunningTask);
    } else {
        // kill old task
        window.clearTimeout(oldRunningTask);
        const newRunningTask = rerun();
        rerunOnUrlChange(window.location.href, rerun, newRunningTask);
    }
};

const runNewDesign = async (settings, api) => {
    // This extention works by listening for changes in
    // window.location.href and running / killing / rerunning
    // a function that injects relevant html on the page.
    initialiseIcons();
    const task = () => {
        const timeout = setTimeout(() => run(settings, api));
        return timeout;
    };
    const runningTask = task();
    rerunOnUrlChange(window.location.href, task, runningTask);
};

export default runNewDesign;
