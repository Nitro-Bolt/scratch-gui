import React from 'react';
import GUI from '../containers/gui.jsx';

const searchParams = new URLSearchParams(location.search);
const cloudHost = searchParams.get('cloud_host') || 'wss://clouddata.turbowarp.org';

const onClickLogo = () => {
    window.location = 'https://dinosaurmod.github.io/Dino-Home';
};

const RenderGUI = props => (
    <GUI
        cloudHost={cloudHost}
        canSave={false}
        onClickLogo={onClickLogo}
        basePath={process.env.ROOT}
        canEditTitle
        enableCommunity
        {...props}
    />
);

export default RenderGUI;
