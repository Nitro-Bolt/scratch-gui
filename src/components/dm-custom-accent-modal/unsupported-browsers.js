const isUnsupported = () => /Firefox|Safari/i.test(navigator.userAgent) || (('userAgentData' in navigator) ? /Opera/i.test(JSON.stringify(navigator.userAgentData.brands)) : !('showOpenFilePicker' in window));

export {
    isUnsupported,
};