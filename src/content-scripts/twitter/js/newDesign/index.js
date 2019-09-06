import { waitUntilDomLoaded, getScreenNameFromUrl } from './utils';

const skippableRoutes = /^\/(home|notifications|explore|messages|i\/|compose|settings|[A-Za-z0-9_]+\/lists)/;

const run = async () => {
    const { pathname } = window.location;
    if (pathname.match(skippableRoutes)) {
        console.log(`TODO: Handle route: "${pathname}"`);
        return;
    }

    await waitUntilDomLoaded();

    const profileScreenName = getScreenNameFromUrl();

    console.log('Handling profile:', profileScreenName);
};

const rerunOnUrlChange = (oldUrl, rerun) => {
    let newUrl = window.location.href;
    if (oldUrl === newUrl) {
        setTimeout(() => rerunOnUrlChange(newUrl), 200);
    } else {
        rerun();
        setTimeout(() => rerunOnUrlChange(window.location.href), 200);
    }
};

const runNewDesign = (settings, api) => {
    rerunOnUrlChange(window.location.href, () => run(settings, api));
    run(settings, api);
};

export default runNewDesign;
