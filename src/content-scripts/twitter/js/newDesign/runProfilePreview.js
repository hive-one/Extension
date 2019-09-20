import OnProfilePreviewInjector from './OnProfilePreviewInjector';

const runProfilePreview = async (settings, api) => {
    const profilePreviewInjector = new OnProfilePreviewInjector(settings, api);
    profilePreviewInjector.run();
};

export default runProfilePreview;
