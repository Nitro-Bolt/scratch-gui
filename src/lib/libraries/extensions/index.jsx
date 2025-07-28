/* eslint-disable max-len */
import React from 'react';
import {FormattedMessage} from 'react-intl';

import musicIconURL from './music/music.png';
import musicInsetIconURL from './music/music-small.svg';

import penIconURL from './pen/pen.png';
import penInsetIconURL from './pen/pen-small.svg';

import videoSensingIconURL from './videoSensing/video-sensing.png';
import videoSensingInsetIconURL from './videoSensing/video-sensing-small.svg';

import text2speechIconURL from './text2speech/text2speech.png';
import text2speechInsetIconURL from './text2speech/text2speech-small.svg';

import speech2textIconURL from './speech2text/speech.png';
import speech2textInsetIconURL from './speech2text/speech-small.svg'

import translateIconURL from './translate/translate.png';
import translateInsetIconURL from './translate/translate-small.png';

import makeymakeyIconURL from './makeymakey/makeymakey.png';
import makeymakeyInsetIconURL from './makeymakey/makeymakey-small.svg';

import animatedTextIconURL from './penguinmod/extensions/text extension.png';
import animatedTextInsetIconURL from './penguinmod/extensions/text extension small.svg';

import microbitIconURL from './microbit/microbit.png';
import microbitInsetIconURL from './microbit/microbit-small.svg';
import microbitConnectionIconURL from './microbit/microbit-illustration.svg';
import microbitConnectionSmallIconURL from './microbit/microbit-small.svg';

import ev3IconURL from './ev3/ev3.png';
import ev3InsetIconURL from './ev3/ev3-small.svg';
import ev3ConnectionIconURL from './ev3/ev3-hub-illustration.svg';
import ev3ConnectionSmallIconURL from './ev3/ev3-small.svg';

import wedo2IconURL from './wedo2/wedo.png'; // TODO: Rename file names to match variable/prop names?
import wedo2InsetIconURL from './wedo2/wedo-small.svg';
import wedo2ConnectionIconURL from './wedo2/wedo-illustration.svg';
import wedo2ConnectionSmallIconURL from './wedo2/wedo-small.svg';
import wedo2ConnectionTipIconURL from './wedo2/wedo-button-illustration.svg';

import boostIconURL from './boost/boost.png';
import boostInsetIconURL from './boost/boost-small.svg';
import boostConnectionIconURL from './boost/boost-illustration.svg';
import boostConnectionSmallIconURL from './boost/boost-small.svg';
import boostConnectionTipIconURL from './boost/boost-button-illustration.svg';

import gdxforIconURL from './gdxfor/gdxfor.png';
import gdxforInsetIconURL from './gdxfor/gdxfor-small.svg';
import gdxforConnectionIconURL from './gdxfor/gdxfor-illustration.svg';
import gdxforConnectionSmallIconURL from './gdxfor/gdxfor-small.svg';

import twIcon from './tw/tw.svg';
import galleryIcon from './gallery/gallery.svg';
import turbowarpIcon from './penguinmod/extensions/turbowarp_icon.svg';

import customExtensionIcon from './custom/custom.svg';
import penguinmodLibraryExtensionIcon from './penguinmod/library.svg';

import turboBuilderIcon from './penguinmod/turbobuilder.png';

import filesExtensionIcon from './penguinmod/extensions/files.png';
import filesOldExtensionIcon from './penguinmod/extensions/files_old.png';
import jgJSONExtensionIcon from './penguinmod/extensions/json.png';
import jgRuntimeExtensionIcon from './penguinmod/extensions/runtime.png';
import jgPrismExtensionIcon from './penguinmod/extensions/prism.png';

import jwProtoExtensionIcon from './penguinmod/extensions/proto.png';
import jwUniteExtensionIcon from './penguinmod/extensions/Unite.png';

import jwStructsExtensionIcon from './penguinmod/extensions/ooplogo.png';

import iygPerlinNoiseExtensionIcon from './penguinmod/extensions/perlinnoisebanner.png';

// thank yo godslayerakp for makin pmCamera :good:
import pmCameraExtensionIcon from './penguinmod/extensions/pmcamera_thumbnail.png';

// cl waw
// import cloudlinkThumb from './penguinmod/extensions/cloudlinkThumb.png';
import cloudlinkIcon from './penguinmod/extensions/cloudlinkIcon.svg';

// thx jeremey
import canvasExtensionBanner from './penguinmod/extensions/CanvasExtensionMenu.png';
import canvasExtensionIcon from './penguinmod/extensions/CanvasSmall.png';

// griffpatch stuff that hopefully we can keep pls plsplspl !!S!
import griffpatchPhysicsThumb from './penguinmod/extensions/griffpatch_physics.png';
import griffpatchPhysicsIcon from './penguinmod/extensions/griffpatch_physicsIcon.svg';

import gp from './penguinmod/extensions/gamepad.svg';
import clippingblending from './penguinmod/extensions/clippingblending.svg';

import pointerlockThumb from './penguinmod/extensions/pointerlock.svg';
import cursorThumb from './penguinmod/extensions/cursor.svg';

// LilyMakesThings 🙏
// import lmsMcUtilsIcon from './penguinmod/extensions/mcutils.png';

// more icons so they arent just red when the extension color is not red
import gsaTempVariablesExtensionIcon from './penguinmod/extensions/tempvariables.png';
import gsaColorUtilExtensionIcon from './penguinmod/extensions/colorutil.png';
import jgIframeExtensionIcon from './penguinmod/extensions/iframe.png';
import jgExtendedAudioExtensionIcon from './penguinmod/extensions/extendedaudio.png';
import jgScratchAuthExtensionIcon from './penguinmod/extensions/scratchauth2.svg';
import jgPermissionExtensionIcon from './penguinmod/extensions/permissions.png';
import silvxrcatOddMessagesExtensionIcon from './penguinmod/extensions/oddmessages.svg';
import jgCloneManagerExtensionIcon from './penguinmod/extensions/clonemanager.png';
import pmInlineBlocksExtensionIcon from './penguinmod/extensions/inlineblocks.png';
import jgPackagerApplicationsExtensionIcon from './penguinmod/extensions/packagedApplications.png';
import jgPackagerApplicationsInsetExtensionIcon from './penguinmod/extensions/packagedApplications_inset.png';

// import jgTweeningExtensionIcon from './penguinmod/extensions/tween.png';
import jgsilvxrcatInterfacesExtensionIcon from './penguinmod/extensions/interfaces2.png';

// 3D MAN WTF
import jg3dExtensionIcon from './penguinmod/extensions/3d.png';
import jg3dInsetExtensionIcon from './penguinmod/extensions/3dicon.png';
import jg3dVrExtensionIcon from './penguinmod/extensions/3dVr.png';
import jg3dVrInsetExtensionIcon from './penguinmod/extensions/3dVr_Inset.png';
import fr3dPhysicsExtensionIcon from './penguinmod/extensions/3d_physics.png';
import fr3dPhysicsInsetExtensionIcon from './penguinmod/extensions/3d_physics_icon_sized.png';

// virtal realty
import jgVrExtensionIcon from './penguinmod/extensions/vr_extension.png';

import theshovelCustomStylesIcon from './penguinmod/orgtw/CustomStyles.svg';
import theshovelCanvasEffectsIcon from './penguinmod/extensions/canvas_effects.png';
import theshovelLzCompressIcon from './penguinmod/orgtw/lz-compress2.svg';
import theshovelColorPickerIcon from './penguinmod/orgtw/ColorPicker.svg';

// events
import jgStorageExtensionIcon from './penguinmod/extensions/storage.png';
import jgTimersExtensionIcon from './penguinmod/extensions/multipletimers.png';
import jgAdvancedTextExtensionIcon from './penguinmod/extensions/advancedtext.png';

import jgJavascriptExtensionIcon from './penguinmod/extensions/javascript.png';
import jgPathfindingExtensionIcon from './penguinmod/extensions/pathfinding.png';
import jgAnimationExtensionIcon from './penguinmod/extensions/animation.png';

// category expansions
import pmMotionExpansionExtensionIcon from './penguinmod/extensions/motion_expanded.png';
import pmEventsExpansionExtensionIcon from './penguinmod/extensions/events_expanded.png';
import pmControlsExpansionExtensionIcon from './penguinmod/extensions/controls_expanded.png';
import pmSensingExpansionExtensionIcon from './penguinmod/extensions/sensing_expanded.png';
import pmOperatorsExpansionExtensionIcon from './penguinmod/extensions/operators_expanded.png';

// dinosaurmod icons
import dmDinoBuilderIcon from './dinosaurmod/dinobuilder.png';
import dmPythonIcon from './dinosaurmod/python.png';
import dmLuaIcon from './dinosaurmod/lua.png';

// other stuff (not official by penguinmod)
import PenguinmodThumb from './penguinmod/unofficial-icons/penguinmod-icon.svg';

// jg: default icon if you are too lazy to make one and you want me to make one instead lololololololol
// gsa: ololololololo
import defaultExtensionIcon from './penguinmod/extensions/placeholder.png';

const urlParams = new URLSearchParams(location.search);

const IsLocal = String(window.location.href).startsWith(`http://localhost:`);
const IsLiveTests = urlParams.has('livetests');
const IsJoke = urlParams.has('joke');
const IsSecret = urlParams.has('verysecretplsnolook');

const menuItems = [
    {
        name: (
            <FormattedMessage
                defaultMessage="Music"
                description="Name for the 'Music' extension"
                id="gui.extension.music.name"
            />
        ),
        extensionId: 'music',
        iconURL: musicIconURL,
        insetIconURL: musicInsetIconURL,
        customInsetColor: '#CF63CF',
        tags: ['scratch'],
        description: (
            <FormattedMessage
                defaultMessage="Play instruments and drums."
                description="Description for the 'Music' extension"
                id="gui.extension.music.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Pen"
                description="Name for the 'Pen' extension"
                id="gui.extension.pen.name"
            />
        ),
        extensionId: 'pen',
        iconURL: penIconURL,
        insetIconURL: penInsetIconURL,
        tags: ['scratch'],
        description: (
            <FormattedMessage
                defaultMessage="Draw with your sprites."
                description="Description for the 'Pen' extension"
                id="gui.extension.pen.description"
            />
        ),
        featured: true
    },
    {
        name: 'Animated Text',
        extensionId: 'text',
        iconURL: animatedTextIconURL,
        insetIconURL: animatedTextInsetIconURL,
        customInsetColor: '#9A66FF',
        tags: ['scratch'],
        description: 'Bring words to life.',
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Video Sensing"
                description="Name for the 'Video Sensing' extension"
                id="gui.extension.videosensing.name"
            />
        ),
        extensionId: 'videoSensing',
        iconURL: videoSensingIconURL,
        insetIconURL: videoSensingInsetIconURL,
        customInsetColor: '#74BDDC',
        tags: ['scratch', 'hardware'],
        description: (
            <FormattedMessage
                defaultMessage="Sense motion with the camera."
                description="Description for the 'Video Sensing' extension"
                id="gui.extension.videosensing.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Text to Speech"
                description="Name for the Text to Speech extension"
                id="gui.extension.text2speech.name"
            />
        ),
        extensionId: 'text2speech',
        collaborator: 'Amazon Web Services',
        iconURL: text2speechIconURL,
        insetIconURL: text2speechInsetIconURL,
        customInsetColor: '#9966FF',
        tags: ['scratch'],
        description: (
            <FormattedMessage
                defaultMessage="Make your projects talk."
                description="Description for the Text to speech extension"
                id="gui.extension.text2speech.description"
            />
        ),
        featured: true,
        internetConnectionRequired: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Speech to Text"
                description="Name for the Text to Speech extension"
                id="gui.extension.speech2text.name"
            />
        ),
        extensionId: 'https://sayamindu.github.io/scratch-extensions/speech_to_text_extension.js',
        inspiredExt: 'Snail-IDE',
        extDeveloper: 'sayamindu',
        iconURL: speech2textIconURL,
        insetIconURL: speech2textInsetIconURL,
        customInsetColor: '#CF63CF',
        description: (
            <FormattedMessage
                defaultMessage="Talk to your projects. Not exactly the same as the Scratch one."
                description="Description for the Speech to text extension"
                id="gui.extension.speech2text.description"
            />
        ),
        featured: true,
        internetConnectionRequired: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Translate"
                description="Name for the Translate extension"
                id="gui.extension.translate.name"
            />
        ),
        extensionId: 'translate',
        collaborator: 'Google',
        iconURL: translateIconURL,
        insetIconURL: translateInsetIconURL,
        customInsetColor: '#5CB1D6',
        tags: ['scratch'],
        description: (
            <FormattedMessage
                defaultMessage="Translate text into many languages."
                description="Description for the Translate extension"
                id="gui.extension.translate.description"
            />
        ),
        featured: true,
        internetConnectionRequired: true
    },
    {
        name: 'Makey Makey',
        extensionId: 'makeymakey',
        collaborator: 'JoyLabz',
        iconURL: makeymakeyIconURL,
        insetIconURL: makeymakeyInsetIconURL,
        customInsetColor: '#E64D00',
        tags: ['scratch', 'hardware'],
        description: (
            <FormattedMessage
                defaultMessage="Make anything into a key."
                description="Description for the 'Makey Makey' extension"
                id="gui.extension.makeymakey.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="OOP"
                description="Name of OOP extension"
                id="jwStructs.jwStructsExtension.name"
            />
        ),
        extensionId: 'jwStructs',
        tags: ['penguinmod'],
        iconURL: jwStructsExtensionIcon,
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: (
            <FormattedMessage
                defaultMessage="OOP blocks. OOp is a programming paradigm that uses objects and their interactions to design applications and computer programs."
                description="Description of OOP extension"
                id="jwStructs.jwStructsExtension.description"
            />
        ),
        featured: true
    },
    {
        name: 'Graphics 2D',
        extensionId: 'https://extensions.turbowarp.org/NOname-awa/graphics2d.js',
        description: 'Blocks to compute lengths, angles, and areas in two dimensions.',
        iconURL: 'https://extensions.turbowarp.org/images/NOname-awa/graphics2d.svg',
        insetIconURL: turbowarpIcon,
        tags: ['turbowarp'],
        extDeveloper: 'NOname-awa',
        customInsetColor: '#ff4d4d',
        featured: true
    },
    {
        name: 'Stage Camera',
        extensionId: 'pmCamera',
        iconURL: pmCameraExtensionIcon,
        tags: ['penguinmod'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: (
            <FormattedMessage
                defaultMessage="Allows the camera to move around anywhere on the stage."
                description="The description for the PenguinMod Camera extension."
                id="pm.extension.camera.description"
            />
        ),
        credits: 'Inspired by⠀⠀⠀⠀⠀⠀ DT-is-not-available',
        featured: true
    },
    {
        name: 'Legacy Files',
        extensionId: 'jgFiles',
        iconURL: filesOldExtensionIcon,
        tags: ['penguinmod', 'datamgmt'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: 'Basic blocks for files.',
        featured: true
    },
    {
        name: 'Files',
        extensionId: 'twFiles',
        twDeveloper: 'GarboMuffin',
        iconURL: filesExtensionIcon,
        insetIconURL: turbowarpIcon,
        tags: ['turbowarp', 'datamgmt'],
        description: 'Blocks for reading and creating files.',
        featured: true
    },
    {
        name: 'Zip',
        extensionId: 'https://extensions.turbowarp.org/CST1229/zip.js',
        iconURL: 'https://extensions.turbowarp.org/images/CST1229/zip.svg',
        insetIconURL: turbowarpIcon,
        tags: ['turbowarp', 'datamgmt'],
        description: 'Create and edit .zip format files, including .sb3 files.',
        twDeveloper: 'CST1229',
        featured: true
    },
    {
        name: 'Streamilator',
        extensionId: 'https://streamilator.github.io/Streamilator/extension.js',
        twDeveloper: 'mdwalters',
        credits: 'snail\-ide',
        iconURL: defaultExtensionIcon,
        insetIconURL: turbowarpIcon,
        tags: ['turbowarp'],
        description: 'A better way to handle audio from urls.',
        featured: true
    },
    {
        name: 'Longman Dictionary',
        extensionId: 'https://extensions.turbowarp.org/veggiecan/LongmanDictionary.js',
        tags: ['turbowarp'],
        iconURL: 'https://extensions.turbowarp.org/images/veggiecan/LongmanDictionary.svg',
        insetIconURL: turbowarpIcon,
        description: "Get the definitions of words from the Longman Dictionary in your projects.",
        featured: true,
        customInsetColor: '#ff4d4d',
        extDeveloper: 'veggiecan0419'
    },
    {
        name: 'Bitwise',
        extensionId: 'https://extensions.turbowarp.org/bitwise.js',
        iconURL: 'https://extensions.turbowarp.org/images/bitwise.svg',
        insetIconURL: turbowarpIcon,
        tags: ['turbowarp'],
        customInsetColor: '#ff4d4d',
        description: 'Blocks that operate on the binary representation of numbers in computers.',
        extDeveloper: 'TrueFantom',
        featured: true
    },
    {
        name: 'Control Controls',
        extensionId: 'https://extensions.turbowarp.org/NexusKitten/controlcontrols.js',
        tags: ['turbowarp'],
        iconURL: 'https://extensions.turbowarp.org/images/NexusKitten/controlcontrols.svg',
        insetIconURL: turbowarpIcon,
        customInsetColor: '#ff4d4d',
        description: "Show and hide the project's controls.",
        featured: true,
        extDeveloper: 'NexusKitten/NamelessCat'
    },
    {
        name: 'Blockly Math',
        extensionId: 'blockly2math',
        credits: 'Google',
        description: 'use math. that\'s it.',
        iconURL: defaultExtensionIcon,
        featured: true
    },
    {
        name: 'Profanity API',
        extensionId: 'profanityAPI',
        description: 'it doesn\'t censor all swear words yet.',
        iconURL: defaultExtensionIcon,
        featured: true
    },
    {
        name: 'Christmas',
        extensionId: 'jgChristmas',
        description: 'use christmas particles',
        tags: ['penguinmod'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        iconURL: defaultExtensionIcon,
        featured: true
    },
    {
        name: 'Pen+',
        extensionId: 'https://extensions.penguinmod.com/extensions/ObviousAlexC/PenPlus.js',
        tags: ['categoryexpansion'],
        iconURL: 'https://extensions.penguinmod.com/images/ObviousAlexC/PenPlus.svg',
        description: "An extension to the Pen category!",
        featured: true,
        extDeveloper: 'pinksheep2917'
    },
    {
        name: 'Sound Systems',
        extensionId: 'jgExtendedAudio',
        iconURL: jgExtendedAudioExtensionIcon,
        tags: ['penguinmod', 'categoryexpansion'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: 'An audio grouping system for more intensive audio work.',
        featured: true
    },
    {
        name: 'Tune Shark V3',
        extensionId: 'https://sharkpools-extensions.vercel.app/extension-code/Tune-Shark-V3.js',
        iconURL: 'https://studio.penguinmod.com/static/assets/ad2841e0f0228e47e911a5b571480f7c.svg',
        tags: ['penguinmod', 'categoryexpansion', 'noisemaker'],
        description: 'Advanced audio engine with complex sound control, multiple audio effects and more!',
        extDeveloper: 'SharkPool',
        featured: true
    },
    {
        name: 'Motion Expansion',
        extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/motion-expansion.js',
        iconURL: pmMotionExpansionExtensionIcon,
        tags: ['dinosaurmod', 'categoryexpansion'],
        description: "More motion-related blocks.",
        featured: true,
        credits: 'Some blocks from NexusKitten',
        extDeveloper: 'MrIncredibleMaker'
    },
    {
        name: 'Looks Expansion',
        extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/penguinmod-version/looks-expansion.js',
        iconURL: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/images/looks-expansion.png',
        tags: ['dinosaurmod', 'categoryexpansion'],
        description: "More blocks for changing layers, get size, # of costumes in different sprites, snapshotting the stage.",
        featured: true,
        credits: 'Some blocks from LilyMakesThings, MrIncredibleMaker'
    },
    {
        name: 'Sound Expansion',
        extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/sound-expansion.js',
        iconURL: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/images/sound-expansion.png',
        tags: ['dinosaurmod', 'categoryexpansion'],
        description: "Play sounds from other URLs, change project volume, get effect values from other sprites and more!",
        featured: true,
        credits: 'Some blocks from LilyMakesThings, MrIncredibleMaker'
    },
    {
        name: 'Events Expansion',
        extensionId: 'pmEventsExpansion',
        iconURL: pmEventsExpansionExtensionIcon,
        tags: ['penguinmod', 'categoryexpansion'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: "More events for sending & receiving information, notifing specific sprites or better control when things should happen.",
        featured: true,
        credits: 'Some blocks from LilyMakesThings'
    },
    {
        name: 'Controls Expansion',
        extensionId: 'pmControlsExpansion',
        iconURL: pmControlsExpansionExtensionIcon,
        tags: ['penguinmod', 'categoryexpansion'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: "More control blocks for animations, complex systems or cleaner one-time use blocks.",
        featured: true,
        credits: 'CST1229'
    },
    {
        name: 'Wait block Expansion',
        extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/waitblockexpansion.js',
        iconURL: pmControlsExpansionExtensionIcon,
        tags: ['dinosaurmod', 'categoryexpansion'],
        description: "More wait blocks, i guess..",
        featured: true,
    },
    {
        name: 'Sensing Expansion',
        extensionId: 'pmSensingExpansion',
        iconURL: pmSensingExpansionExtensionIcon,
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        tags: ['penguinmod', 'categoryexpansion'],
        description: "More sensing blocks for specific use cases or interacting with the user's device.",
        credits: 'Some blocks from SharkPool-SP',
        featured: true
    },
    {
        name: 'Operators Expansion',
        extensionId: 'pmOperatorsExpansion',
        iconURL: pmOperatorsExpansionExtensionIcon,
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        tags: ['penguinmod', 'categoryexpansion'],
        description: 'More operators like nand, nor, character code to character, reading multiple lined text line by line, etc.',
        featured: true
    },
    {
        name: 'My Blocks+',
        extensionId: 'https://sharkpools-extensions.vercel.app/extension-code/My-Blocks-Plus.js',
        iconURL: 'https://raw.githubusercontent.com/SharkPool-SP/SharkPools-Extensions/refs/heads/main/extension-thumbs/My-Blocks-Plus.svg',
        tags: ['penguinmod', 'categoryexpansion'],
        description: 'Create private or global custom blocks with custom inputs, colors, and more!',
        extDeveloper: 'SharkPool, CST1229, 0znzw',
        featured: true
    },
    {
        name: 'Dropdown Maker',
        extensionId: 'https://sharkpools-extensions.vercel.app/extension-code/Dropdown-Maker.js',
        iconURL: 'https://sharkpools-extensions.vercel.app/extension-thumbs/Dropdown-Maker.svg',
        tags: ['penguinmod'],
        description: 'Create Custom Dropdowns! Best paired with My Blocks+',
        extDeveloper: 'SharkPool, CST1229, 0znzw',
        featured: true
    },
    {
        name: 'Better Comments',
        extensionId: 'https://sharkpools-extensions.vercel.app/extension-code/Better-Comments.js',
        iconURL: 'https://raw.githubusercontent.com/SharkPool-SP/SharkPools-Extensions/refs/heads/main/extension-thumbs/Better-Comments.svg',
        tags: ['penguinmod', 'categoryexpansion'],
        description: 'Better Comments with Customization and Markdown support',
        extDeveloper: 'SharkPool',
        featured: true
    },
    {
        name: 'JSON',
        extensionId: 'jgJSON',
        iconURL: jgJSONExtensionIcon,
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        tags: ['penguinmod', 'datamgmt'],
        description: 'Blocks for handling JSON objects and Arrays.',
        featured: true
    },
    {
        name: 'Particle Engine',
        extensionId: 'https://sharkpools-extensions.vercel.app/extension-code/Particle-Engine.js',
        iconURL: 'https://studio.penguinmod.com/static/assets/bd055c3853854218f060871e694b16f7.svg',
        tags: ['penguinmod', 'graphics'],
        description: 'Create powerful Particle Engines without Clones',
        extDeveloper: 'SharkPool',
        featured: true
    },
    {
        name: 'Hacked Blocks',
        extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/penguinmod-version/hackedblocks.js',
        iconURL: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/images/hackedblocks.png',
        tags: ['dinosaurmod'],
        description: 'Hacked Blocks that exist in Penguinmod but are not shown on the main toolbox.',
        credits: 'Some blocks from pumpkinhasapatch, LilyMakesThings, MrIncredibleMakerZE',
        featured: true
    },
    {
        name: 'Custom Styles',
        extensionId: 'shovelcss',
        iconURL: theshovelCustomStylesIcon,
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        tags: ['penguinmod'],
        description: 'Customize the appearance of variable monitors and prompts in your project.',
        extDeveloper: 'TheShovel',
        featured: true
    },
    {
        name: 'TurboWeather',
        extensionId: 'https://extensions.penguinmod.com/extensions/RubyDevs/turboweather.js',
        iconURL: 'https://extensions.penguinmod.com/images/RubyDevs/turboweather.webp',
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        tags: ['penguinmod'],
        description: "Show weather and location data for any place in our world. Data that could be used for doxxing is deleted from results.",
        featured: true,
    },
    {
        name: 'Local Storage',
        extensionId: 'https://extensions.turbowarp.org/local-storage.js',
        iconURL: 'https://extensions.turbowarp.org/images/local-storage.svg',
        insetIconURL: turbowarpIcon,
        tags: ['turbowarp'],
        description: 'Store data persistently. Like cookies, but better.',
        customInsetColor: '#ff4d4d',
        featured: true
    },
    {
        name: 'Clipboard',
        extensionId: 'https://extensions.turbowarp.org/clipboard.js',
        tags: ['turbowarp'],
        insetIconURL: turbowarpIcon,
        customInsetColor: '#ff4d4d',
        iconURL: 'https://extensions.turbowarp.org/images/clipboard.svg',
        description: "Read and write from the system clipboard.",
        featured: true,
    },
    {
        name: 'Physics',
        extensionId: 'https://extensions.turbowarp.org/box2d.js',
        tags: ['turbowarp'],
        extDeveloper: 'griffpatch',
        iconURL: griffpatchPhysicsThumb,
        insetIconURL: griffpatchPhysicsIcon,
        description: 'Box2D Physics extension created by Griffpatch.',
        customInsetColor: '#D9F0FF',
        featured: true
    },
    {
        name: 'Jul Mik Utilities',
        extensionId: 'https://electramod-extensions-gallery.vercel.app/extensions/julmik6478/julmik_utilities.js',
        credits: 'V1 & V2 by julmik6478, V3 by Aness6040',
        description: 'An Extension of Blocks Utilities by Jul Mik (V1 and V2 when named Jul Mik Blocks with Turbobuilder) and helped by Aness6040 (Actual v3)',
        iconURL: 'https://electramod-extensions-gallery.vercel.app/images/julmik6478/julmik_utilities.svg',
        featured: true
    },
    {
        name: 'More Keys Event',
        extensionId: 'https://ldsjvg.webwave.dev/lib/ldsjvg/more-keys-ltair3aw.js',
        iconURL: defaultExtensionIcon,
        tags: ['categoryexpansion'],
        description: 'This extension adds a hat block with support for f1, f2, f3... keys and alt key.',
        extDeveloper: 'julmik6478',
        featured: true
    },
    {
        name: 'Tweening',
        extensionId: 'jgTween',
        credits: 'easings.net & Arrow',
        description: 'Smoothly animating values using different easing functions and directions.',
        iconURL: 'https://extensions.turbowarp.org/images/JeremyGamer13/tween.svg',
        tags: ['penguinmod'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        featured: true
    },
    {
        name: 'Tailgating',
        extensionId: 'jgTailgating',
        description: 'Have sprites & clones follow behind other sprites & clones by an offset, like RPG party members.',
        iconURL: 'https://distrot.github.io/static/assets/ff2dc3c9ffca9e8097e82e3ff64b5955.png',
        tags: ['penguinmod'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        featured: true
    },
    {
        name: 'Tile Grids',
        extensionId: 'https://extensions.penguinmod.com/extensions/SharkPool/Tile-Grids.js',
        iconURL: 'https://extensions.penguinmod.com/images/SharkPool/Tile-Grids.svg',
        tags: ['penguinmod'],
        description: 'Place sprites on grids.',
        extDeveloper: 'SharkPool-SP',
        featured: true
    },
    {
        name: 'Canvas Effects',
        extensionId: 'theshovelcanvaseffects',
        iconURL: theshovelCanvasEffectsIcon,
        tags: ['penguinmod'],
        description: 'Apply visual effects to the entire stage.',
        extDeveloper: 'TheShovel',
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        featured: true
    },
    {
        name: 'Fetch',
        extensionId: 'https://extensions.turbowarp.org/fetch.js',
        tags: ['turbowarp'],
        iconURL: 'https://extensions.turbowarp.org/images/fetch.svg',
        insetIconURL: turbowarpIcon,
        customInsetColor: '#ff4d4d',
        description: "Make requests to the broader internet.",
        featured: true,
    },
    {
        name: 'Clones+',
        extensionId: 'https://extensions.turbowarp.org/Lily/ClonesPlus.js',
        tags: ['turbowarp', 'categoryexpansion'],
        iconURL: 'https://extensions.turbowarp.org/images/Lily/ClonesPlus.svg',
        insetIconURL: turbowarpIcon,
        description: "Expansion of Scratch's clone features.",
        featured: true,
        twDeveloper: 'LilyMakesThings'
    },
    {
        name: 'Base',
        extensionId: 'https://extensions.turbowarp.org/true-fantom/base.js',
        tags: ['turbowarp'],
        iconURL: 'https://extensions.turbowarp.org/images/true-fantom/base.svg',
        insetIconURL: turbowarpIcon,
        description: "Convert numbers between bases.",
        customInsetColor: '#ff4d4d',
        featured: true,
        extDeveloper: 'TrueFantom'
    },
    {
        name: 'Skins',
        extensionId: 'https://extensions.turbowarp.org/Lily/Skins.js',
        tags: ['turbowarp'],
        iconURL: 'https://extensions.turbowarp.org/images/Lily/Skins.svg',
        insetIconURL: turbowarpIcon,
        description: "Have your sprites show themselves as other images or costumes.",
        featured: true,
        twDeveloper: 'LilyMakesThings'
    },
    {
        name: 'Multiple Timers',
        extensionId: 'jgTimers',
        iconURL: jgTimersExtensionIcon,
        tags: ['penguinmod'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: 'Create different timers you can control seperately.',
        eventSubmittor: 'Arrow',
        featured: true
    },
    {
        name: 'Time',
        extensionId: 'https://extensions.turbowarp.org/-SIPC-/time.js',
        tags: ['turbowarp'],
        iconURL: 'https://extensions.turbowarp.org/images/-SIPC-/time.svg',
        insetIconURL: turbowarpIcon,
        customInsetColor: '#ff4d4d',
        description: "Blocks for interacting with unix timestamps and other date strings.",
        featured: true,
        extDeveloper: '-SIPC-'
    },
    {
        name: 'Temporary Variables',
        extensionId: 'tempVars',
        iconURL: gsaTempVariablesExtensionIcon,
        tags: ['penguinmod'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: 'Create variables for use in one block stack. Useful to not clutter the variable list with variables you only use once.',
        credits: 'LilyMakesThings',
        featured: true
    },
    {
        name: 'TurboWarp Temporary Variables',
        extensionId: 'lmsTempVars2',
        iconURL: 'https://studio.penguinmod.com/static/assets/cf21e9b36c0dfd5debc399d6fbf5d2c9.svg',
        tags: ['turbowarp'],
        description: 'Create disposable runtime or thread variables.',
        insetIconURL: turbowarpIcon,
        credits: 'LilyMakesThings',
        featured: true
    },
    {
        name: 'RGB Channels',
        extensionId: 'https://extensions.turbowarp.org/Longboost/color_channels.js',
        iconURL: 'https://extensions.turbowarp.org/images/Longboost/color_channels.svg',
        insetIconURL: turbowarpIcon,
        customInsetColor: '#ff4d4d',
        tags: ['turbowarp'],
        description: 'Only render or stamp certain RGB channels.',
        featured: true
    },
    {
        name: 'Typable Tab Key',
        extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/typable-tab-character.js',
        iconURL: defaultExtensionIcon,
        tags: ['dinosaurmod'],
        description: 'Gives the ability of typing the tab character.',
        featured: true
    },
    {
        name: 'Runtime Modifications',
        extensionId: 'jgRuntime',
        tags: ['penguinmod'],
        iconURL: jgRuntimeExtensionIcon,
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: 'Blocks for updating Scratch objects like the stage and sprites.',
        credits: 'TheShovel, showierdata9978',
        featured: true
    },
    {
        name: 'Site Runtime',
        extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/webextension.js',
        tags: ['dinosaurmod'],
        iconURL: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/images/site-runtime.png',
        description: 'A Combined version of 2 Extensions: Packager Applications & AdaBrowser',
        featured: true,
        extDeveloper: 'MrIncredibleMaker',
        internetConnectionRequired: true,
        disabled: false
    },
    {
        name: 'Search Params',
        extensionId: 'https://extensions.turbowarp.org/ZXMushroom63/searchApi.js',
        tags: ['turbowarp'],
        iconURL: 'https://extensions.turbowarp.org/images/ZXMushroom63/searchApi.svg',
        insetIconURL: turbowarpIcon,
        description: "Interact with URL search parameters: the part of the URL after a question mark.",
        featured: true,
        customInsetColor: '#ff4d4d',
        extDeveloper: 'ZXMushroom63'
    },
    {
        name: 'Font Manager',
        extensionId: 'https://extensions.penguinmod.com/extensions/SharkPool/Font-Manager.js',
        iconURL: 'https://extensions.penguinmod.com/images/SharkPool/Font-Manager.svg',
        tags: ['penguinmod'],
        description: 'Manage, create, and delete fonts.',
        credits: 'SharkPool, Ashimee',
        featured: true
    },
    {
        name: 'Storage',
        extensionId: 'jgStorage',
        iconURL: jgStorageExtensionIcon,
        tags: ['penguinmod', 'datamgmt'],
        description: 'Store data after PenguinMod has already been closed out. Basic Server Storage is also included.',
        eventSubmittor: 'Fir & silvxrcat',
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        featured: true
    },
    {
        name: 'HTTP',
        extensionId: 'https://extensions.turbowarp.org/godslayerakp/http.js',
        iconURL: 'https://extensions.turbowarp.org/images/godslayerakp/http.svg',
        insetIconURL: turbowarpIcon,
        tags: ['turbowarp'],
        description: 'Comprehensive extension for interacting with external websites.',
        featured: true,
        internetConnectionRequired: true,
        customInsetColor: '#ff4d4d'
    },
    {
        name: 'Cast',
        extensionId: 'https://extensions.turbowarp.org/Lily/Cast.js',
        iconURL: 'https://extensions.turbowarp.org/images/Lily/Cast.svg',
        insetIconURL: turbowarpIcon,
        tags: ['turbowarp'],
        customInsetColor: '#ff4d4d',
        description: 'Convert values between types.',
        featured: true,
        extDeveloper: 'LilyMakesThings',
        internetConnectionRequired: false,
    },
    {
        name: "All Menus",
        extensionId: 'https://extensions.turbowarp.org/Lily/AllMenus.js',
        iconURL: 'https://extensions.turbowarp.org/images/Lily/AllMenus.svg',
        insetIconURL: turbowarpIcon,
        customInsetColor: '#ff4d4d',
        tags: ['turbowarp'],
        description: 'Special category with all menus from every Scratch category including extensions, whenever you add one to the toolbox.',
        featured: true,
        extDeveloper: 'LilyMakesThings',
        internetConnectionRequired: false,
    },
    {
        name: 'CloudLink',
        extensionId: 'https://mikedev101.github.io/cloudlink/scratch/cloudlink_penguinmod.js',
        tags: ['turbowarp', 'penguinmod'],
        insetIconURL: cloudlinkIcon,
        iconURL: 'https://extensions.penguinmod.com/images/MikeDev101/cloudlink.svg',
        description: 'A powerful WebSocket extension for Scratch.',
        featured: true,
        extDeveloper: 'MikeDev101',
        internetConnectionRequired: true
    },
    {
        name: 'Scripts',
        extensionId: 'jgScripts',
        iconURL: 'https://studio.penguinmod.com/static/assets/e8cd6294973f94c475ed746e4899fa33.svg',
        tags: ['penguinmod', 'datamgmt'],
        description: 'Create compiled scripts with blocks while the project is running.',
        featured: true
    },
    {
        name: 'Pang API',
        extensionId: 'https://extensions.penguinmod.com/extensions/SammerLOL/pangapi.js',
        iconURL: 'https://extensions.penguinmod.com/images/SammerLOL/pangapi.png',
        tags: ['penguinmod'],
        description: 'Fetch information from the PenguinMod API.',
        extDeveloper: 'oc9x97',
        featured: true
    },
    {
        name: "Data Analysis",
        extensionId: 'https://extensions.turbowarp.org/qxsck/data-analysis.js',
        iconURL: 'https://extensions.turbowarp.org/images/qxsck/data-analysis.svg',
        insetIconURL: turbowarpIcon,
        customInsetColor: '#ff4d4d',
        tags: ['turbowarp'],
        description: 'Blocks to compute means, medians, maximums, minimums, variances, and modes.',
        featured: true,
        extDeveloper: 'qxsck'
    },
    {
        name: '3D Math',
        extensionId: 'https://extensions.penguinmod.com/extensions/ObviousAlexC/3DMath.js',
        iconURL: 'https://extensions.penguinmod.com/images/ObviousAlexC/3DMath.svg',
        tags: ['penguinmod', '3d', 'graphics'],
        description: 'A handful of utilities for making your own sprite-based 3D engine.',
        extDeveloper: 'pinksheep2917',
        featured: true
    },
    {
        name: 'Extra Mathematics',
        extensionId: 'https://extensions.penguinmod.com/extensions/jwklong/mathematics.js',
        iconURL: 'https://extensions.penguinmod.com/images/jwklong/mathematics.png',
        tags: ['penguinmod', 'categoryexpansion'],
        description: 'Complicated maths extension for nerds.',
        extDeveloper: 'jwklong',
        featured: true
    },
    {
        name: 'Random Utilities',
        extensionId: 'https://extensions.penguinmod.com/extensions/Gen1x/random_utils.js',
        iconURL: 'https://extensions.penguinmod.com/images/Gen1x/randomutils.png',
        tags: ['penguinmod'],
        description: 'Many blocks related to generating random values, including seed-based number generation, true number generation, UUID\'s, random strings, etc.',
        extDeveloper: 'G1nX',
        featured: true
    },
    {
        name: 'Project Page',
        extensionId: 'https://extensions.penguinmod.com/extensions/jwklong/projectpage.js',
        iconURL: 'https://extensions.penguinmod.com/images/jwklong/projectpage.png',
        tags: ['penguinmod'],
        description: 'Modify and affect the studio project page from the code. How annoying can an extension possibly be?',
        featured: true,
        extDeveloper: 'jwklong'
    },
    /*
    {
        name: 'ChatGPT',
        extensionId: 'https://anonymous-cat1.github.io/WorkingTurboGPT/extension.js',
        iconURL: 'https://anonymous-cat1.github.io/WorkingTurboGPT/img/thumb.svg',
        description: 'Use ChatGPT in your projects.',
        extDeveloper: 'Diseveled_cat',
        featured: true,
    },
    */
    /*{
        name: 'PenguinAI⚠',
        extensionId: 'https://extensions.penguinmod.com/extensions/MubiLop/penguingpt.js',
        iconURL: 'https://extensions.penguinmod.com/images/MubiLop/penguingpt.png',
        tags: ['penguinmod'],
        description: 'Talk to AI! Use Models like DALL-E-3, GPT, LLama, Claude, and more! Please read PenguinMod\'s Privacy Policy before use.',
        extDeveloper: 'MubiLop',
        internetConnectionRequired: true,
        featured: true
    },*/
    {
        name: 'LZ Compress',
        extensionId: 'shovellzcompresss',
        iconURL: theshovelLzCompressIcon,
        tags: ['penguinmod', 'datamgmt'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: 'Compress and decompress text using lz-string.',
        extDeveloper: 'TheShovel',
        featured: true
    },
    {
        name: 'Prism',
        extensionId: 'jgPrism',
        tags: ['penguinmod', 'datamgmt'],
        iconURL: jgPrismExtensionIcon,
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: 'Blocks for specific use-cases or major convenience.',
        featured: true
    },
    {
        name: 'Numerical Encoding V2',
        customInsetColor: '#ff4d4d',
        extensionId: 'https://extensions.turbowarp.org/numerical-encoding-2.js',
        iconURL: 'https://extensions.turbowarp.org/images/numerical-encoding-2.svg',
        insetIconURL: turbowarpIcon,
        tags: ['turbowarp'],
        description: 'Encode strings as numbers for cloud variables.',
        // credits: 'cs2627883',
        featured: true
    },
    {
        name: 'Odd Messages',
        extensionId: 'oddMessage',
        iconURL: silvxrcatOddMessagesExtensionIcon,
        description: 'For logging and variable utilization.',
        featured: true,
        extDeveloper: 'silvxrcat'
    },
    {
        name: 'Recording',
        extensionId: 'https://extensions.penguinmod.com/extensions/SharkPool/Recording.js',
        tags: ['penguinmod'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        iconURL: 'https://extensions.penguinmod.com/images/SharkPool/Recording.svg',
        description: 'Record your voice while you run your projects!',
        featured: true,
        extDeveloper: 'SharkPool',
        internetConnectionRequired: false
    },
    {
        name: 'GitHub API',
        extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/github-api.js',
        iconURL: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/images/githubapi.png',
        tags: ['dinosaurmod'],
        description: 'Fetch IDs, Description, etc. from Repositories, Users and Organizations.',
        internetConnectionRequired: true,
        featured: true
    },
    {
        name: 'HTML iframe Elements',
        extensionId: 'jgIframe',
        iconURL: jgIframeExtensionIcon,
        tags: ['penguinmod'],
        description: 'Blocks to place and move around frames that contain HTML content or websites.',
        featured: true,
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        internetConnectionRequired: true
    },
    {
        name: 'Color Picker',
        extensionId: 'shovelColorPicker',
        iconURL: theshovelColorPickerIcon,
        tags: ['penguinmod'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: 'Allow the user to choose a color using the built-in color picker, so you don\'t need to make your own.',
        extDeveloper: 'TheShovel',
        featured: true
    },
    {
        name: 'Color Utility Blocks',
        extensionId: 'colors',
        iconURL: gsaColorUtilExtensionIcon,
        tags: ['penguinmod'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: 'Converters for Hex, RGB, HSV and Decimal colors and other color related things.',
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Labels"
                description="Name of Proto extension"
                id="jwProto.jwProtoExtension.name"
            />
        ),
        extensionId: 'jwProto',
        iconURL: jwProtoExtensionIcon,
        tags: ['penguinmod'],
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: (
            <FormattedMessage
                // change this back if you update the extension to have more things
                defaultMessage="Labelling and Placeholders."
                description="Description of Proto extension"
                id="jwProto.jwProtoExtension.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Perlin Noise"
                description="Name of perlin noise extension"
                id="iygPerlin.iygPerlinExtension.name"
            />
        ),
        extensionId: 'iygPerlin',
        tags: ['penguinmod'],
        iconURL: iygPerlinNoiseExtensionIcon,
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        description: (
            <FormattedMessage
                defaultMessage="Blocks for generating and using Perlin noise. Good for generating terrain, clouds, and other things."
                description="Description of perlin noise extension"
                id="iygPerlin.iygPerlinExtension.description"
            />
        ),
        featured: true
    },
    {
        name: 'Sound Waves',
        extensionId: 'https://extensions.penguinmod.com/extensions/SharkPool/Sound-Waves.js',
        iconURL: 'https://extensions.penguinmod.com/images/SharkPool/Sound-Waves.svg',
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        tags: ['penguinmod'],
        description: 'Make sounds with oscillators!',
        credits: 'SharkPool',
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="HTML Canvas"
                description="Name of Text extension"
                id="canvas.name"
            />
        ),
        extensionId: 'canvas',
        iconURL: canvasExtensionBanner,
        tags: ['penguinmod'],
        insetIconURL: canvasExtensionIcon,
        customInsetColor: '#0094FF',
        description: (
            <FormattedMessage
                defaultMessage="Extra drawing tools using an HTML Canvas. Works well when used with other extensions."
                description="Description of Text extension"
                id="text.description"
            />
        ),
        featured: true
    },
    {
        name: 'GamePad',
        extensionId: 'Gamepad',
        tags: ['turbowarp', 'hardware'],
        insetIconURL: turbowarpIcon,
        twDeveloper: 'GarboMuffin',
        iconURL: gp,
        description: (
            <FormattedMessage
                defaultMessage="Directly access gamepads instead of just mapping buttons to keys."
                description="Description for the 'GamePad' extension"
                id="GamepadExtension.GamepadExtension.description"
            />
        ),
        featured: true
    },
    {
        name: 'Printing',
        tags: ['penguinmod', 'hardware'],
        extensionId: 'sharkpoolPrinting',
        iconURL: 'https://studio.penguinmod.com/static/assets/1a086f192347214d507e8373d05481bd.svg',
        description: 'Allows you to show a dialog for printing text, images, and custom HTML to a printer.',
        featured: true
    },
    {
        name: 'Clipping and Blending',
        extensionId: 'https://extensions.turbowarp.org/Xeltalliv/clippingblending.js',
        iconURL: clippingblending,
        tags: ['turbowarp'],
        insetIconURL: turbowarpIcon,
        description: 'Clipping outside of a specified rectangular area and additive color blending.',
        featured: true,
        twDeveloper: 'Vadik1'
    },
    {
        name: 'Pointer Lock',
        extensionId: 'https://extensions.turbowarp.org/pointerlock.js',
        tags: ['turbowarp'],
        insetIconURL: turbowarpIcon,
        iconURL: pointerlockThumb,
        description: (
            <FormattedMessage
                defaultMessage="A extension to lock the mouse cursor in the stage"
                description="Scratch utilities"
                id="gui.extension.pointerlock.description"
            />
        ),
        featured: true,
        internetConnectionRequired: false,
        twDeveloper: 'GarboMuffin'
    },
    {
        name: 'Mouse Cursor',
        extensionId: 'https://extensions.turbowarp.org/cursor.js',
        tags: ['turbowarp'],
        insetIconURL: turbowarpIcon,
        iconURL: 'https://extensions.turbowarp.org/images/cursor.png',
        description: (
            <FormattedMessage
                defaultMessage="A extension to change what the mouse cursor looks like on the stage"
                description="Scratch utilities"
                id="gui.extension.MouseCursor.description"
            />
        ),
        featured: true,
        internetConnectionRequired: false,
        twDeveloper: 'GarboMuffin'
    },
    {
        name: 'Scratch Authentication',
        extensionId: 'jgScratchAuthenticate',
        iconURL: jgScratchAuthExtensionIcon,
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        tags: ['penguinmod'],
        description: "Interact with Scratch Authentication to prove the player is a real scratch user.",
        featured: true
    },
    {
        name: 'Save Data',
        extensionId: 'https://dinosaurmod.github.io/savedata.js',
        iconURL: 'https://snail-ide.js.org/static/assets/14ea6745b6f8a3c8e3cb4d3392f04573.svg',
        insetIconURL: PenguinmodThumb,
        collaborator: 'Snail IDE (Slighty modified from their extension)',
        customInsetColor: '#00c3ff',
        tags: ['penguinmod','turbowarp'],
        description: "Extremely easy way to save data.",
        featured: true
    },
    {
        name: 'JavaScript',
        extensionId: 'jgJavascript',
        iconURL: jgJavascriptExtensionIcon,
        insetIconURL: PenguinmodThumb,
        customInsetColor: '#00c3ff',
        tags: ['penguinmod', 'programminglanguage'],
        description: 'Run your own custom code written in JavaScript!',
        featured: true
    },
    {
        name: 'Python',
        extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/python.js',
        iconURL: dmPythonIcon,
        tags: ['dinosaurmod', 'programminglanguage'],
        description: 'Run your own custom code written in Python using Pyodide!',
        credits: 'Pyodide',
        featured: true
    },
    {
        name: 'Lua',
        extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/lua.js',
        iconURL: dmLuaIcon,
        tags: ['dinosaurmod', 'programminglanguage'],
        description: 'Run your own custom code written in Lua using Fengari!',
        credits: 'Fengari',
        featured: true
    },
    {
        name: 'Arrays',
        extensionId: 'jwArray',
        iconURL: 'https://studio.penguinmod.com/static/assets/21a46a49b55befa73d6b8352e2795d6f.svg',
        tags: ['penguinmod', 'datamgmt'],
        description: 'Store data efficiently in multi-purpose arrays.',
        extDeveloper: 'jwklong',
        featured: true
    },
    {
        name: 'Targets',
        extensionId: 'jwTargets',
        iconURL: 'https://studio.penguinmod.com/static/assets/174cbb7cc72418e5f095e0b734ceed1d.svg',
        tags: ['penguinmod'],
        description: 'Direct access to sprites and their clones.',
        extDeveloper: 'jwklong',
        featured: true
    },
    {
        name: 'Infinity',
        extensionId: 'jwNum',
        iconURL: 'https://studio.penguinmod.com/static/assets/03562df738acb5b29670d58970eb432f.svg',
        tags: ['penguinmod'],
        description: 'Advanced number type capable of really big numbers.',
        extDeveloper: 'jwklong',
        credits: 'Naruyoko for ExpantaNum.js',
        featured: true
    },
    {
        name: 'Color',
        extensionId: 'jwColor',
        iconURL: 'https://studio.penguinmod.com/static/assets/88ab038784badd192df6bd931d7c2e40.svg',
        tags: ['penguinmod', 'graphics'],
        description: 'Utilities for anything involving colors.',
        extDeveloper: 'jwklong',
        featured: true
    },
    {
        name: 'Vector',
        extensionId: 'jwVector',
        iconURL: 'https://studio.penguinmod.com/static/assets/3b0c388c2cf1462401585224ffe2f077.svg',
        tags: ['penguinmod'],
        description: 'Vector type for calculating with X and Y coordinates.',
        extDeveloper: 'jwklong',
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="TurboWarp Blocks"
                description="Name of TW extension"
                id="tw.twExtension.name"
            />
        ),
        extensionId: 'tw',
        twDeveloper: 'GarboMuffin',
        tags: ['turbowarp'],
        insetIconURL: turbowarpIcon,
        iconURL: twIcon,
        description: 'Weird new blocks.',
        featured: true
    },
    {
        name: 'DinosaurMod Blocks',
        extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/dinosaurmodextras.js',
        iconURL: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/images/dinosaurmodextras.png',
        tags: ['dinosaurmod'],
        description: 'Extra Blocks',
        inspiredExt: 'TurboWarp Blocks',
        featured: true
    },
    {
        name: 'micro:bit',
        extensionId: 'microbit',
        collaborator: 'micro:bit',
        iconURL: microbitIconURL,
        insetIconURL: microbitInsetIconURL,
        tags: ['scratch', 'hardware'],
        description: (
            <FormattedMessage
                defaultMessage="Connect your projects with the world."
                description="Description for the 'micro:bit' extension"
                id="gui.extension.microbit.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: true,
        internetConnectionRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: false,
        connectionIconURL: microbitConnectionIconURL,
        connectionSmallIconURL: microbitConnectionSmallIconURL,
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting"
                description="Message to help people connect to their micro:bit."
                id="gui.extension.microbit.connectingMessage"
            />
        ),
        helpLink: 'https://scratch.mit.edu/microbit'
    },
    {
        name: 'LEGO MINDSTORMS EV3',
        extensionId: 'ev3',
        collaborator: 'LEGO',
        iconURL: ev3IconURL,
        insetIconURL: ev3InsetIconURL,
        tags: ['scratch', 'hardware'],
        description: (
            <FormattedMessage
                defaultMessage="Build interactive robots and more."
                description="Description for the 'LEGO MINDSTORMS EV3' extension"
                id="gui.extension.ev3.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: true,
        internetConnectionRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: false,
        connectionIconURL: ev3ConnectionIconURL,
        connectionSmallIconURL: ev3ConnectionSmallIconURL,
        customInsetColor: '#FFBF00',
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting. Make sure the pin on your EV3 is set to 1234."
                description="Message to help people connect to their EV3. Must note the PIN should be 1234."
                id="gui.extension.ev3.connectingMessage"
            />
        ),
        helpLink: 'https://scratch.mit.edu/ev3'
    },
    {
        name: 'LEGO BOOST',
        extensionId: 'boost',
        collaborator: 'LEGO',
        iconURL: boostIconURL,
        insetIconURL: boostInsetIconURL,
        tags: ['scratch', 'hardware'],
        description: (
            <FormattedMessage
                defaultMessage="Bring robotic creations to life."
                description="Description for the 'LEGO BOOST' extension"
                id="gui.extension.boost.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: true,
        internetConnectionRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: true,
        connectionIconURL: boostConnectionIconURL,
        connectionSmallIconURL: boostConnectionSmallIconURL,
        connectionTipIconURL: boostConnectionTipIconURL,
        customInsetColor: '#FFAB19',
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting"
                description="Message to help people connect to their BOOST."
                id="gui.extension.boost.connectingMessage"
            />
        ),
        helpLink: 'https://scratch.mit.edu/boost'
    },
    {
        name: 'LEGO Education WeDo 2.0',
        extensionId: 'wedo2',
        collaborator: 'LEGO',
        iconURL: wedo2IconURL,
        insetIconURL: wedo2InsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Build with motors and sensors."
                description="Description for the 'LEGO WeDo 2.0' extension"
                id="gui.extension.wedo2.description"
            />
        ),
        featured: true,
        disabled: false,
        tags: ['scratch', 'hardware'],
        bluetoothRequired: true,
        internetConnectionRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: true,
        connectionIconURL: wedo2ConnectionIconURL,
        connectionSmallIconURL: wedo2ConnectionSmallIconURL,
        connectionTipIconURL: wedo2ConnectionTipIconURL,
        customInsetColor: '#FF6680',
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting"
                description="Message to help people connect to their WeDo."
                id="gui.extension.wedo2.connectingMessage"
            />
        ),
        helpLink: 'https://scratch.mit.edu/wedo'
    },
    {
        name: 'Go Direct Force & Acceleration',
        extensionId: 'gdxfor',
        collaborator: 'Vernier',
        iconURL: gdxforIconURL,
        insetIconURL: gdxforInsetIconURL,
        customInsetColor: '#4C97FF',
        tags: ['scratch', 'hardware'],
        description: (
            <FormattedMessage
                defaultMessage="Sense push, pull, motion, and spin."
                description="Description for the Vernier Go Direct Force and Acceleration sensor extension"
                id="gui.extension.gdxfor.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: true,
        internetConnectionRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: false,
        connectionIconURL: gdxforConnectionIconURL,
        connectionSmallIconURL: gdxforConnectionSmallIconURL,
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting"
                description="Message to help people connect to their force and acceleration sensor."
                id="gui.extension.gdxfor.connectingMessage"
            />
        ),
        helpLink: 'https://scratch.mit.edu/vernier'
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="PenguinMod Extra Extensions"
                description="Name of library item to open the Extra Extensions gallery"
                id="pm.extraLibraryExtensions.name"
            />
        ),
        href: 'https://extensions.penguinmod.com/',
        extensionId: 'special_penguinmodExtensionLibrary',
        iconURL: 'https://studio.penguinmod.com/static/assets/7a4510ab192e5a0bd0b1186db1396bce.svg',
        description: (
            <FormattedMessage
                defaultMessage="See some user-submitted extensions. Opens in a new tab."
                description="Description of library item to open the Extra Extensions gallery"
                id="pm.extraLibraryExtensions.description"
            />
        ),
        tags: ['penguinmod', 'collections'],
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="TurboWarp Extension Gallery"
                description="Name of extensions.turbowarp.org in extension library"
                id="tw.extensionGallery.name"
            />
        ),
        href: 'https://extensions.turbowarp.org/',
        extensionId: 'special_turbowarpExtensionLibrary',
        iconURL: galleryIcon,
        description: (
            <FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage="We list many TurboWarp extensions here for convenience, but you can find even more on extensions.turbowarp.org."
                description="Description of extensions.turbowarp.org in extension library"
                id="tw.extensionGallery.description"
            />
        ),
        tags: ['tw', 'collections'],
        featured: true
    },
    {
        name: 'SharkPool\'s Extension Collection',
        href: 'https://sharkpools-extensions.vercel.app/?originPM=true',
        extensionId: 'special_sharkpoolExtensionLibrary',
        iconURL: 'https://studio.penguinmod.com/static/assets/93259f95026260bc06f83d29d3b89115.svg',
        description: 'Tons of extensions created by SharkPool.\n\nClick on an extension while this menu is open to add it to your project.',
        tags: ['collections'],
        credits: 'Listed in the site',
        featured: true
    },
    {
        name: 'TurboBuilder',
        href: 'https://turbobuilder.vercel.app',
        extensionId: 'special_turboBuilder',
        iconURL: turboBuilderIcon,
        description: 'Create your own amazing extensions using a scratch-based UI!',
        credits: 'Started by JeremyGamer13, continued by jwklong',
        featured: true,
        disabled: false
    },
    {
        name: 'CreateExt',
        href: 'https://ext-create.vercel.app/',
        extensionId: 'special_ExtCreate',
        iconURL: 'https://snail-ide.js.org/static/assets/2bcc1426567c2ca1179de43c02577d1a.svg',
        description: '[Temporarily disabled due to the link not working.] Snail IDE version of TurboBuilder',
        collaborator: 'Started by JeremyGamer13, continued by jwklong, modified by nmsderp',
        disabled: true,
        featured: true
    },
    {
        name: 'TurboBuilder - Dev Branch',
        href: 'https://dev-turbobuilder.vercel.app/',
        extensionId: 'special_turboBuilderDev',
        iconURL: 'https://studio.penguinmod.com/static/assets/78d464ee4e15000ce44b841ff2f4c518.png',
        description: 'Publicly available developer branch, with the latest features.',
        credits: 'Started by JeremyGamer13, continued by jwklong',
        tags: ['extcreate'],
        featured: true
    },
    {
        name: 'DinoBuilder',
        href: 'https://dinobuilder.vercel.app',
        extensionId: 'special_dinoBuilder',
        iconURL: dmDinoBuilderIcon,
        description: 'Create your own amazing extensions using a TurboBuilder Mod scratch-based UI!',
        credits: 'MrIncredibleMakerZe',
        featured: true,
        disabled: false
    },
    {
        name: 'ExtForge',
        href: 'https://jwklong.github.io/extforge/',
        extensionId: 'special_extforge',
        iconURL: 'https://studio.penguinmod.com/static/assets/49a8736bf7fbb79e2469272f127e06d3.svg',
        description: 'Create extensions with a block-based UI.',
        extDeveloper: 'jwklong',
        featured: true,
    },
    {
        // not really an extension, but it's easiest to present it as one
        name: (
            <FormattedMessage
                defaultMessage="Custom Extension"
                description="Name of library item to load a custom extension from a remote source"
                id="tw.customExtension.name"
            />
        ),
        extensionId: '',
        iconURL: customExtensionIcon,
        description: (
            <FormattedMessage
                defaultMessage="Load custom extensions from URLs, files, or JavaScript source code."
                description="Description of library item to load a custom extension from a custom source"
                id="tw.customExtension.description"
            />
        ),
        tags: ['tw'],
        featured: true
    }
];

if (IsLocal || IsLiveTests) {
    const extras = [
        '---',
        {
            name: 'Clone Communication',
            extensionId: 'jgClones',
            iconURL: jgCloneManagerExtensionIcon,
            tags: ['penguinmod'],
            description: 'Mainly sharing data between clones and the main sprite, but also some other small features. This has been replaced by the TurboWarp Clones+ extension.',
            featured: true
        },
        {
            name: '3D',
            extensionId: 'jg3d',
            iconURL: jg3dExtensionIcon,
            tags: ['penguinmod'],
            customInsetColor: '#B200FF',
            insetIconURL: jg3dInsetExtensionIcon,
            description: 'Use the magic of 3D to spice up your project.',
            featured: true
        },
        {
            name: '3D Physics',
            extensionId: 'fr3d',
            iconURL: fr3dPhysicsExtensionIcon,
            tags: ['penguinmod'],
            customInsetColor: '#D066FE',
            insetIconURL: fr3dPhysicsInsetExtensionIcon,
            description: 'Physics for the 3D extension.',
            featured: true
        },
        {
            name: 'Fetch+',
            extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/fetchplus.js',
            tags: ['dinosaurmod'],
            iconURL: 'https://extensions.turbowarp.org/images/fetch.svg',
            description: "get and post stuff, i guess.",
            featured: true,
        },
        {
            name: 'Easy Save',
            extensionId: 'jgEasySave',
            iconURL: defaultExtensionIcon,
            tags: ['penguinmod'],
            description: 'Save variables, lists and extra info to a file, then load those things back in.',
            featured: true
        },
        {
            name: '(OLD) Motion Expansion',
            extensionId: 'pmMotionExpansion',
            iconURL: pmMotionExpansionExtensionIcon,
            tags: ['penguinmod', 'categoryexpansion'],
            insetIconURL: PenguinmodThumb,
            customInsetColor: '#00c3ff',
            description: "Replaced by the dinosaurmod version. More small motion blocks for movement or collision.",
            featured: true,
            credits: 'Some blocks from NexusKitten'
        },
        {
            name: 'Extra Inputs',
            extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/extrainputs.js',
            tags: ['dinosaurmod'],
            iconURL: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/images/ExtraInputsThumbnail.png',
            description: "This Extension has been merged into the main toolbox. Extra Inputs that you can use.",
            featured: true,
            extDeveloper: 'MrIncredibleMakerZe'
        },
        {
            name: 'Timers Plus',
            extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/legacy-extensions/timers-plus.js',
            tags: ['dinosaurmod'],
            iconURL: defaultExtensionIcon,
            description: "(Timers don't save currently!) Create your own timers! There's also pause and resume options.",
            featured: true,
            extDeveloper: 'MrIncredibleMakerZe'
        },
        {
            name: 'Unite',
            extensionId: 'jwUnite',
            iconURL: jwUniteExtensionIcon,
            tags: ['penguinmod'],
            description: 'Legacy extension that was eventually merged into the default toolbox.',
            featured: true
        },
        {
            name: 'XML',
            extensionId: 'jwXml',
            iconURL: 'https://studio.penguinmod.com/static/assets/73077ae1577fa8af2e8544e19e447491.png',
            tags: ['penguinmod', 'datamgmt'],
            description: 'Enables the creation and getting of XML data. Not yet able to modify data.',
            extDeveloper: 'jwklong',
            featured: true
        },
        {
            name: 'TurboBuilder Extension',
            extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/legacy-extensions/turbobuilder.js',
            iconURL: turboBuilderIcon,
            description: 'Not alot of options yet. Create your own amazing extensions!',
            tags: ['dinosaurmod'],
            credits: 'MrIncredibleMaker',
            featured: true,
        },
        {
            name: 'Debugging',
            extensionId: 'jgDebugging',
            iconURL: defaultExtensionIcon,
            tags: ['penguinmod'],
            description: 'Log information and run commands. Good for debugging packaged projects or just easily changing things.',
            featured: true
        },
        {
            name: 'PenguinMod Permissions',
            extensionId: 'JgPermissionBlocks',
            iconURL: jgPermissionExtensionIcon,
            tags: ['penguinmod'],
            description: 'Legacy extension, old blocks no longer serve a real purpose. Direct blocks to manage permissions that PenguinMod requires you have to do certain tasks.',
            featured: true
        },
        {
            name: 'Jeremys Dev Tools',
            extensionId: 'jgDev',
            iconURL: defaultExtensionIcon,
            tags: ['penguinmod'],
            description: 'Test extension to see if things are possible.\nDO NOT USE THIS IN PRODUCTION as blocks are subject to change and may corrupt your projects.',
            featured: true
        },
        {
            name: '3D Virtual Reality',
            extensionId: 'jg3dVr',
            iconURL: jg3dVrExtensionIcon,
            tags: ['penguinmod', 'hardware'],
            customInsetColor: '#B200FF',
            insetIconURL: jg3dVrInsetExtensionIcon,
            description: 'In development. May break compatibility. Allow players to really jump into your world!',
            featured: true
        },
        {
            name: 'Advanced Text',
            extensionId: 'jgAdvancedText',
            eventSubmittor: 'eggo',
            iconURL: jgAdvancedTextExtensionIcon,
            tags: ['penguinmod'],
            description: 'In development. Currently not publicly available.',
            featured: true
        },
        {
            name: 'Interfaces',
            extensionId: 'jgInterfaces',
            iconURL: jgsilvxrcatInterfacesExtensionIcon,
            credits: 'silvxrcat',
            tags: ['penguinmod'],
            description: 'In development.',
            featured: true
        },
        {
            name: 'Packager Applications',
            extensionId: 'jgPackagerApplications',
            iconURL: jgPackagerApplicationsExtensionIcon,
            insetIconURL: jgPackagerApplicationsInsetExtensionIcon,
            twDeveloper: 'CubesterYT',
            customInsetColor: '#66B8FF',
            tags: ['penguinmod', 'packager'],
            description: 'In development. Do extra things in packaged applications that you can\'t do in the website!',
            featured: true
        },
        {
            name: 'Inline Blocks',
            extensionId: 'pmInlineBlocks',
            iconURL: pmInlineBlocksExtensionIcon,
            tags: ['penguinmod'],
            description: 'Create quick blocks for simple tasks. Insert them into any circle spot and have them return any value you want.',
            featured: true
        },
        {
            name: (
                <FormattedMessage
                    defaultMessage="Pathfinding"
                    description="Name of Pathfinding extension"
                    id="jgPathfinding.Pathfinding.name"
                />
            ),
            extensionId: 'jgPathfinding',
            tags: ['penguinmod'],
            iconURL: jgPathfindingExtensionIcon,
            description: (
                <FormattedMessage
                    defaultMessage="(Unstable and or laggy; Needs further work) Have sprites navigate around obstacles in your game instead of clipping into them."
                    description="Description of Pathfinding extension"
                    id="jgPathfinding.Pathfinding.description"
                />
            ),
            featured: true
        },
        {
            name: 'Animation',
            extensionId: 'jgAnimation',
            iconURL: jgAnimationExtensionIcon,
            tags: ['penguinmod'],
            description: 'In development. Currently not publicly available.',
            featured: true
        },
        {
            name: 'Virtual Reality',
            extensionId: 'jgVr',
            iconURL: jgVrExtensionIcon,
            tags: ['penguinmod', 'hardware'],
            description: 'In development.',
            credits: 'Vadik1',
            featured: true
        },
    ];
    menuItems.push('---');
    extras.forEach(ext => {
        menuItems.push(ext);
    });
};

if (IsSecret && IsJoke) {
    const secret = [
        '---',
        {
            name: 'MR BEAST UTILITIES',
            extensionId: 'https://turbololder.vercel.app/extensions/mrbeastutil.js',
            iconURL: 'https://turbololder.vercel.app/images/Mr_Beast_Utilitities.svg',
            description: 'the best blockes ever',
            extDeveloper: 'JeremyGamer13',
            featured: true
        },
        {
            name: 'Jungle Inferno',
            extensionId: 'https://turbololder.vercel.app/extensions/jungleinferno.js',
            iconURL: 'https://turbololder.vercel.app/images/none.png',
            description: 'a good',
            extDeveloper: 'LilyMakesThings',
            featured: true
        },
        {
            name: 'Fleef',
            extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/legacy-extensions/fleef.js',
            iconURL: defaultExtensionIcon,
            description: 'this extension refuses to be committed.',
            extDeveloper: 'MrIncredibleMaker',
            featured: true
        },
    ];
    menuItems.push('---');
    secret.forEach(ext => {
        menuItems.push(ext);
    });
}

if (IsJoke) {
    const JokeExtensions = [
        '---',
        {
            name: 'Cats',
            extensionId: 'https://extensions.penguinmod.com/extensions/Gen1x/CATS.js',
            tags: ['penguinmod'],
            insetIconURL: PenguinmodThumb,
            customInsetColor: '#00c3ff',
            iconURL: 'https://extensions.penguinmod.com/images/Gen1x/cats.png',
            description: "Blocks related to cats.",
            featured: true,
            extDeveloper: 'G1nX',
        },
        {
            name: 'Dogs',
            extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/DOGS.js',
            iconURL: defaultExtensionIcon,
            tags: ['dinosaurmod'],
            description: 'Blocks related to dogs.',
            featured: true,
            inspiredExt: 'G1nX\'s Cats Extension',
        },
        {
            name: 'McUtils',
            extensionId: 'https://extensions.turbowarp.org/Lily/McUtils.js', // update reference once file names are updated
            tags: ['turbowarp'],
            iconURL: 'https://extensions.turbowarp.org/images/Lily/McUtils.png',
            insetIconURL: turbowarpIcon,
            description: 'Basic utilities for any fast food employee',
            featured: true,
            twDeveloper: 'LilyMakesThings'
        },
        {
            name: 'an amazing extension',
            extensionId: 'jgBestExtension',
            iconURL: 'https://extensions.penguinmod.com/images/JeremyGamer13/epic.png',
            internetConnectionRequired: true,
            tags: ['penguinmod', 'joke'],
            description: 'this is SUCH A GOOD EXTENSION USE IT NOW',
            featured: true
        },
        {
            name: 'Epic utilities',
            extensionId: 'https://extensions.penguinmod.com/extensions/SharkPool/AprilFools.js',
            iconURL: 'https://extensions.penguinmod.com/images/JeremyGamer13/epicutils.png',
            tags: ['penguinmod', 'joke'],
            description: 'the super good utilities brought to you by todays sponsor sharkpool (the epic utilities)',
            featured: true
        },
        {
            name: 'image blocks',
            extensionId: 'https://extensions.penguinmod.com/extensions/Ashime/funneimageblocks.js',
            iconURL: 'https://extensions.penguinmod.com/images/JeremyGamer13/screenshot1.png',
            tags: ['penguinmod', 'joke'],
            internetConnectionRequired: true,
            description: 'who needs cat blocks when you have penguin block',
            extDeveloper: 'Ashimee, 0znzw, CST1229',
            featured: true
        },
        {
            name: 'fire in the hole',
            extensionId: 'https://extensions.penguinmod.com/extensions/JeremyGamer13/FireInTheHole.js',
            iconURL: 'https://library.penguinmod.com/files/emojis/cluelesssmile.png',
            tags: ['penguinmod', 'joke', 'forbidden'],
            internetConnectionRequired: true,
            description: 'this joke is not funny anymore',
            featured: true
        },
        {
            name: 'Numberblocks Extension',
            extensionId: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/extensions/numberblocks.js',
            iconURL: 'https://gabsthecuriouskid.github.io/DinosaurModExtensions/images/numberblocks.png',
            tags: ['dinosaurmod'],
            description: 'a numberblocks extension.',
            credits: 'Numberblocks',
            featured: true
        },
        {
            name: 'the doo doo extension',
            extensionId: 'jgDooDoo',
            iconURL: defaultExtensionIcon,
            tags: ['penguinmod'],
            insetIconURL: PenguinmodThumb,
            customInsetColor: '#00c3ff',
            description: 'a joke extension.',
            featured: true
        },
    ];
    menuItems.push('---');
    JokeExtensions.forEach(ext => {
        menuItems.push(ext);
    });
}

console.log(menuItems)

export default menuItems;
