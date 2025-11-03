import { isMobile } from './pm-mobile';

const available = () => !!window.showSaveFilePicker;

const showSaveFilePicker = fileName => window.showSaveFilePicker({
    suggestedName: fileName,
    ...(isMobile() ? {} : {
        types: [
            {
                description: 'DinosaurMod Project',
                accept: {
                    'application/x.scratch.sb3': '.dino'
                }
            },
            {
                description: 'Snail-IDE Project',
                accept: {
                    'application/x.scratch.sb3': '.snail'
                }
            },
            {
                description: 'PenguinMod Project',
                accept: {
                    'application/x.scratch.sb3': '.pmp'
                }
            },
            {
                description: 'Scratch 3.0 Project',
                accept: {
                    'application/x.scratch.sb3': '.sb3'
                }
            }
        ],
        excludeAcceptAllOption: true
    }),
});

const showOpenFilePicker = async () => {
    const [handle] = await window.showOpenFilePicker({
        multiple: false,
        ...(isMobile() ? {} : {
            types: [
                {
                    description: 'Supported Files',
                    accept: {
                        'application/x.scratch.sb3': ['.dino', '.snail', '.pmp', '.pm', '.sb3', '.sb2', '.sb']
                    }
                },
                {
                    description: 'DinosaurMod Project',
                    accept: {
                        'application/x.scratch.sb3': ['.dino']
                    }
                },
                {
                    description: 'Snail-IDE Project',
                    accept: {
                        'application/x.scratch.sb3': ['.snail']
                    }
                },
                {
                    description: 'PenguinMod Project',
                    accept: {
                        'application/x.scratch.sb3': ['.pmp', '.pm']
                    }
                },
                {
                    description: 'Scratch Project',
                    accept: {
                        'application/x.scratch.sb3': ['.sb3', '.sb2', '.sb']
                    }
                }
            ]
        }),
    });
    return handle;
};

const showDirectoryPicker = async (optId, optStartIn) => {
    const handle = await window.showDirectoryPicker({
        id: optId || "pm-directory-picker",
        mode: "readwrite",
        startIn: optStartIn || "documents",
    });
    return handle;
};

export default {
    available,
    showOpenFilePicker,
    showSaveFilePicker,
    showDirectoryPicker
};
