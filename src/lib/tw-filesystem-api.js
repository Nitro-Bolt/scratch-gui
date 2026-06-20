import { isApiAvailable, isTypeFilterAvailable } from './pm-mature-fs-available';

const available = isApiAvailable;

// pm: Some bad mobile devices block any file type (iOS), so these funcs should allow all files on mobile
const showSaveFilePicker = fileName => window.showSaveFilePicker({
    suggestedName: fileName,
    ...(!isTypeFilterAvailable() ? {} : {
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
            },
            {
                description: 'ZIP (file format)',
                accept: {
                    'application/x.scratch.sb3': '.zip'
                }
            }
        ],
        excludeAcceptAllOption: true
    }),
});

const showOpenFilePicker = async () => {
    const [handle] = await window.showOpenFilePicker({
        multiple: false,
        ...(!isTypeFilterAvailable() ? {} : {
            types: [
                {
                    description: 'Supported Files',
                    accept: {
                        'application/x.scratch.sb3': ['.dino', '.snail', '.pmp', '.pm', '.sb3', '.sb2', '.sb', '.zip']
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
                },
                {
                    description: 'ZIP (file format)',
                    accept: {
                        'application/x.scratch.sb3': ['.zip']
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
