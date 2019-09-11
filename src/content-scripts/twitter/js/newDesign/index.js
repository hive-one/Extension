import runProfile from './runProfile';
import { initialiseIcons } from './utils';

const skippableRoutes = /^\/(home|notifications|explore|messages|i\/|compose|settings|[A-Za-z0-9_]+\/lists)/;

const run = async (settings, api) => {
    const { pathname } = window.location;

    if (pathname === '/' || pathname.match(skippableRoutes)) {
        console.log(`TODO: Handle route: "${pathname}"`);
        return;
    }

    // TODO: waitUntiltrue
    // pass a function which loops / sleeps until true
    // I keep getting the error "Failed finding profile image for roy12312312"

    // RUN PROFILE
    runProfile(settings, api);
};

const rerunOnUrlChange = (oldUrl, rerun) => {
    let newUrl = window.location.href;
    if (oldUrl === newUrl) {
        setTimeout(() => rerunOnUrlChange(newUrl, rerun), 200);
    } else {
        console.log(oldUrl, newUrl);

        rerun();
        setTimeout(() => rerunOnUrlChange(window.location.href, rerun), 200);
    }
};

const runNewDesign = (settings, api) => {
    initialiseIcons();
    rerunOnUrlChange(window.location.href, () => run(settings, api));
    run(settings, api);
};

export default runNewDesign;
