function isUnsupported () {
    const userAgent = navigator.userAgent;
    const userAgentData = 'userAgentData' in navigator ? navigator.userAgentData.brands : null;

    if (userAgent.includes('Firefox')) return true;
    if (userAgentData.includes('Opera')) return true;
    if (!('showOpenFilePicker' in window)) return true;
    return false;
}

isUnsupported ()

export {
    isUnsupported,
};