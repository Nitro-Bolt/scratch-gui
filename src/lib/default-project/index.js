import projectData from './project-data';

/* eslint-disable import/no-unresolved */
import overrideDefaultProject from '!arraybuffer-loader!./usual-default-project.sb3';
import backdrop from '!raw-loader!./cd21514d0531fdffb22204e0ec5ed84a.svg';
import costume1 from '!raw-loader!./penguin.svg';
import costume2 from '!raw-loader!./dino2.svg';
import costume3 from '!raw-loader!./dino3.svg';
import costume4 from '!raw-loader!./dino4.svg';
/* eslint-enable import/no-unresolved */
import {TextEncoder} from '../tw-text-encoder';

const defaultProject = translator => {
    if (overrideDefaultProject.byteLength > 0) {
        return [{
            id: 0,
            assetType: 'Project',
            dataFormat: 'JSON',
            data: overrideDefaultProject
        }];
    }

    let _TextEncoder;
    if (typeof TextEncoder === 'undefined') {
        _TextEncoder = require('text-encoding').TextEncoder;
    } else {
        _TextEncoder = TextEncoder;
    }
    const encoder = new _TextEncoder();

    const projectJson = projectData(translator);
    return [{
        id: 0,
        assetType: 'Project',
        dataFormat: 'JSON',
        data: JSON.stringify(projectJson)
    }, {
        id: 'cd21514d0531fdffb22204e0ec5ed84a',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(backdrop)
    }, {
        id: '592bae6f8bb9c8d88401b54ac431f7b6',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume1)
    }, {
        id: '61826d1f7ebade6b17e879198b460b23',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume2)
    }, {
        id: 'a2acb3d0f1d4f14132b43c31821f1c5d',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume3)
    }, {
        id: '03d8f0b2148d6c6697fa59a9507d4829',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume4)
    }];
};

export default defaultProject;
