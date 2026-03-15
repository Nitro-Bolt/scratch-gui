// taken from the packager so this should be accurate?
const isSafari = () =>
    !navigator.userAgentData &&
    /Safari\//.test(navigator.userAgent) &&
    !/Chrom(e|ium)\//.test(navigator.userAgent);

export default isSafari;