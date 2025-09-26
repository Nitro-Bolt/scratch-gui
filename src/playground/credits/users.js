const shuffle = list => {
    for (let i = list.length - 1; i > 0; i--) {
        const random = Math.floor(Math.random() * (i + 1));
        const tmp = list[i];
        list[i] = list[random];
        list[random] = tmp;
    }
    return list;
};

const fromHardcoded = ({ userId, username, name }) => ({
    image: `https://trampoline.turbowarp.org/avatars/${userId}`,
    href: `https://scratch.mit.edu/users/${username}/`,
    text: name || username
});

const fromHardcodedGithub = username => ({
    image: `https://github.com/${username}.png`,
    href: `https://github.com/${username}/`,
    text: username
});
const fromHardcodedNamed = username => ({
    image: `https://penguinmod.com/unknown_user.png`,
    href: "https://studio.penguinmod.com/credits.html#",
    text: username
});

const fromHardcodedDiscord = async userId => {
    const res = await fetch(`https://pmupdatereader.jeremygamer13.repl.co/user/${userId}`);
    const json = await res.json();
    return {
        image: json.avatarURL,
        text: json.username
    };
};

const addonDevelopers = [
    {
        userId: '34018398',
        username: 'Jeffalo'
    },
    {
        userId: '64184234',
        username: 'ErrorGamer2000'
    },
    {
        userId: '41616512',
        username: 'pufferfish101007'
    },
    {
        userId: '61409215',
        username: 'TheColaber'
    },
    {
        userId: '1882674',
        username: 'griffpatch'
    },
    {
        userId: '10817178',
        username: 'apple502j'
    },
    {
        userId: '16947341',
        username: '--Explosion--'
    },
    {
        userId: '14880401',
        username: 'Sheep_maker'
    },
    {
        userId: '9981676',
        username: 'NitroCipher'
    },
    {
        userId: '2561680',
        username: 'lisa_wolfgang'
    },
    {
        userId: '60000111',
        username: 'GDUcrash'
    },
    {
        userId: '4648559',
        username: 'World_Languages'
    },
    {
        userId: '17340565',
        username: 'GarboMuffin'
    },
    {
        userId: '5354974',
        username: 'Chrome_Cat'
    },
    {
        // actual ID is 34455896 but their avatar is the wrong resolution and looks really weird
        userId: '0',
        username: 'summerscar'
    },
    {
        userId: '55742784',
        username: 'RedGuy7'
    },
    {
        userId: '9636514',
        username: 'Tacodiva7729'
    },
    {
        userId: '14792872',
        username: '_nix'
    },
    {
        userId: '30323614',
        username: 'BarelySmooth'
    },
    {
        userId: '64691048',
        username: 'CST1229'
    }
    // TODO: retronbv is banned?
].map(fromHardcoded);

const pmDevelopers = [
    'GabsTheCuriousKid',
].map(fromHardcodedGithub);

// todo: should translators be only named or...?
const pmTranslators = [
    'GabsTheCuriousKid',
    'Supermetafora204321'
].map(fromHardcodedGithub);
const pmTranslatorsNamed = [
    ''
].map(fromHardcodedNamed);

const logoArtists = Promise.all([
    '593554048188416001'
].map(fromHardcodedDiscord));

const pmCostumeSubmittors = [
    // accounts
    {
        text: 'budc123',
        image: `https://github.com/budc123.png`,
        href: `https://github.com/budc123/`,
    },
    {
        text: 'concertalyis',
        image: `https://github.com/concertalyis.png`,
        href: `https://github.com/concertalyis/`,
    },
    {
        text: 'WojtekCodesToday',
        image: `https://github.com/WojtekCodesToday.png`,
        href: `https://github.com/WojtekCodesToday/`,
    },
    {
        text: 'ddededodediamante',
        image: `https://github.com/ddededodediamante.png`,
        href: `https://github.com/ddededodediamante/`,
    },
    {
        text: 'G1nX',
        image: `https://trampoline.turbowarp.org/avatars/by-username/G1nX`,
        href: "https://penguinmod.com/profile?user=G1nX",
    },
    // unknown
    {
        text: 'maroonmball',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'eviepepsi',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: '1340073',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'cubeycreator',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'novaspiderultra',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'poundpound0209',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'gdplayer1035',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'cognitixsammy',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'thebusyman',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'skyglide5',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'cxnnie09',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'hoveras',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'blockgamer904',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
];
const pmSoundSubmittors = [
    // accounts
    {
        text: 'ddededodediamante',
        image: `https://github.com/ddededodediamante.png`,
        href: `https://github.com/ddededodediamante/`,
    },
    {
        text: 'concertalyis',
        image: `https://github.com/concertalyis.png`,
        href: `https://github.com/concertalyis/`,
    },
    {
        text: 'G1nX',
        image: `https://trampoline.turbowarp.org/avatars/by-username/G1nX`,
        href: "https://penguinmod.com/profile?user=G1nX",
    },
    // unknown
    {
        text: 'maroonmball',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'jn567',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'lukepuke311',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'ma_01',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'poundpound0209',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'cognitixsammy',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
    {
        text: 'mememaster9000',
        image: `https://penguinmod.com/unknown_user.png`,
        href: "https://studio.penguinmod.com/credits.html#",
    },
];


const extensionDevelopers = [
    'GarboMuffin',
    'griffpatch',
    'DT-is-not-available',
    'Vadik1',
    'MikeDev',
    'LilyMakesThings'
].map(fromHardcodedGithub);
const pmExtensionDevelopers = [
    'silvxrcat',
    'nexuskitten',
    'G1nX-01',
    'SharkPool-SP',
    'David-Orangemoon',
    // 'pooiod' // add if ListsPlus gets merged
].map(fromHardcodedGithub);

const pmCodeUsedFrom = [
    {
        text: "PenguinMod",
        image: `https://github.com/PenguinMod.png`,
        href: `https://github.com/PenguinMod/`,
    },
    {
        text: "TurboWarp",
        image: `https://github.com/TurboWarp.png`,
        href: `https://github.com/TurboWarp/`,
    },
    {
        text: "scratchfoundation",
        image: `https://github.com/scratchfoundation.png`,
        href: `https://github.com/scratchfoundation/`,
    },
    {
        text: "Nitro-Bolt",
        image: `https://github.com/Nitro-Bolt.png`,
        href: `https://github.com/Nitro-Bolt/`,
    },
    {
        text: "Snail-IDE",
        image: `https://github.com/Snail-IDE.png`,
        href: `https://github.com/Snail-IDE/`,
    },
    // TODO: There are 1000% more projects we've used some stuff from but I don't remember
];

export default {
    addonDevelopers: shuffle(addonDevelopers),
    pmDevelopers: shuffle(pmDevelopers),
    logoArtists: shuffle(logoArtists),
    extensionDevelopers: shuffle(extensionDevelopers),
    pmExtensionDevelopers: shuffle(pmExtensionDevelopers),
    pmSoundSubmittors: shuffle(pmSoundSubmittors),
    pmCostumeSubmittors: shuffle(pmCostumeSubmittors),
    pmTranslators: [].concat(shuffle(pmTranslators), shuffle(pmTranslatorsNamed)),
    pmCodeUsedFrom: shuffle(pmCodeUsedFrom),
};
