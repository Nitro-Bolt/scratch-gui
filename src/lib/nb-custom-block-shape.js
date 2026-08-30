/* eslint-disable */
const defaultBlockShape = {
    paddingSize: 100,
    cornerSize: 100,
    notchSize: 100
};

const BLOCK_SHAPE_PRESETS = [
    {
        name: '3.0 Blocks',
        id: 'default3',
        description: 'The regular appearance of Scratch 3.0 blocks',
        values: {
            paddingSize: 100,
            cornerSize: 100,
            notchSize: 100
        }
    },
    {
        name: '2.0 Blocks',
        id: 'default2',
        description: 'An appearance similar to Scratch 2.0 blocks',
        values: {
            paddingSize: 70,
            cornerSize: 150,
            notchSize: 75
        }
    },
    {
        name: '3.0 Flat',
        id: 'flat3',
        description: 'Scratch 3.0 blocks with notches and corners removed',
        values: {
            paddingSize: 100,
            cornerSize: 0,
            notchSize: 0
        }
    },
    {
        name: '2.0 Flat',
        id: 'flat2',
        description: 'Scratch 2.0 blocks with notches and corners removed',
        values: {
            paddingSize: 70,
            cornerSize: 0,
            notchSize: 0
        }
    }
];

const getBlockShape = (preferences, key = 'block-shape') => ({
    ...defaultBlockShape,
    ...(preferences[key] || {})
});

const applyBlockShape = (ScratchBlocks, shape) => {
    const {
        paddingSize = defaultBlockShape.paddingSize,
        cornerSize = defaultBlockShape.cornerSize,
        notchSize = defaultBlockShape.notchSize
    } = shape;

    const BlockSvg = ScratchBlocks.BlockSvg;
    const originalDropdownObject = ScratchBlocks.FieldDropdown.prototype.positionArrow;

    const {GRID_UNIT} = BlockSvg;

    let multiplier = paddingSize / 100;
    cornerSize = cornerSize / 100;
    notchSize = notchSize / 100;
    BlockSvg.SEP_SPACE_Y = 2 * GRID_UNIT * multiplier;
    BlockSvg.MIN_BLOCK_X = 16 * GRID_UNIT * multiplier;
    BlockSvg.MIN_BLOCK_X_OUTPUT = 12 * GRID_UNIT * multiplier;
    BlockSvg.MIN_BLOCK_X_SHADOW_OUTPUT = 10 * GRID_UNIT * multiplier;
    BlockSvg.MIN_BLOCK_Y = 12 * GRID_UNIT * multiplier;
    BlockSvg.EXTRA_STATEMENT_ROW_Y = 8 * GRID_UNIT * multiplier;
    BlockSvg.MIN_BLOCK_X_WITH_STATEMENT = 40 * GRID_UNIT * multiplier;
    BlockSvg.MIN_BLOCK_Y_SINGLE_FIELD_OUTPUT = 8 * GRID_UNIT * multiplier;
    BlockSvg.MIN_BLOCK_Y_REPORTER = 10 * GRID_UNIT * multiplier;
    BlockSvg.MIN_STATEMENT_INPUT_HEIGHT = 6 * GRID_UNIT * multiplier;
    BlockSvg.NOTCH_WIDTH = 8 * GRID_UNIT * multiplier;
    BlockSvg.NOTCH_HEIGHT = 2 * GRID_UNIT * multiplier * notchSize;
    BlockSvg.NOTCH_START_PADDING = 3 * GRID_UNIT;
    BlockSvg.ICON_SEPARATOR_HEIGHT = 10 * GRID_UNIT * multiplier;
    BlockSvg.NOTCH_PATH_LEFT =
        'c 2,0 3,' +
        1 * notchSize +
        ' 4,' +
        2 * notchSize +
        ' l ' +
        4 * multiplier * notchSize +
        ',' +
        4 * multiplier * notchSize +
        ' c 1,' +
        1 * notchSize +
        ' 2,' +
        2 * notchSize +
        ' 4,' +
        2 * notchSize +
        ' h ' +
        24 * (multiplier - 0.5) +
        ' c 2,0 3,-' +
        1 * notchSize +
        ' 4,-' +
        2 * notchSize +
        ' l ' +
        4 * multiplier * notchSize +
        ',' +
        -4 * multiplier * notchSize +
        'c 1,-' +
        1 * notchSize +
        ' 2,-' +
        2 * notchSize +
        ' 4,-' +
        2 * notchSize;
    BlockSvg.NOTCH_PATH_RIGHT =
        'h ' +
        (-4 * (cornerSize - 1) - 5 * (1 - notchSize)) +
        'c -2,0 -3,' +
        1 * notchSize +
        ' -4,' +
        2 * notchSize +
        ' l ' +
        -4 * multiplier * notchSize +
        ',' +
        4 * multiplier * notchSize +
        ' c -1,' +
        1 * notchSize +
        ' -2,' +
        2 * notchSize +
        ' -4,' +
        2 * notchSize +
        ' h ' +
        -24 * (multiplier - 0.5) +
        ' c -2,0 -3,-' +
        1 * notchSize +
        ' -4,-' +
        2 * notchSize +
        ' l ' +
        -4 * multiplier * notchSize +
        ',' +
        -4 * multiplier * notchSize +
        'c -1,-' +
        1 * notchSize +
        ' -2,-' +
        2 * notchSize +
        ' -4,-' +
        2 * notchSize;
    BlockSvg.INPUT_SHAPE_HEXAGONAL =
        'M ' +
        4 * GRID_UNIT * multiplier +
        ',0 ' +
        ' h ' +
        4 * GRID_UNIT +
        ' l ' +
        4 * GRID_UNIT * multiplier +
        ',' +
        4 * GRID_UNIT * multiplier +
        ' l ' +
        -4 * GRID_UNIT * multiplier +
        ',' +
        4 * GRID_UNIT * multiplier +
        ' h ' +
        -4 * GRID_UNIT +
        ' l ' +
        -4 * GRID_UNIT * multiplier +
        ',' +
        -4 * GRID_UNIT * multiplier +
        ' l ' +
        4 * GRID_UNIT * multiplier +
        ',' +
        -4 * GRID_UNIT * multiplier +
        ' z';
    BlockSvg.INPUT_SHAPE_HEXAGONAL_WIDTH = 12 * GRID_UNIT * multiplier;
    BlockSvg.INPUT_SHAPE_OBJECT =
        'M ' +
        4 * GRID_UNIT * multiplier +
        ' 0 ' +
        ' c ' +
        -3 * GRID_UNIT * multiplier +
        ' 0 ' +
        -1.75 * GRID_UNIT * multiplier +
        ' ' +
        3.5 * GRID_UNIT * multiplier +
        ' ' +
        -4 * GRID_UNIT * multiplier +
        ' ' +
        4 * GRID_UNIT * multiplier +
        ' c ' +
        2.25 * GRID_UNIT * multiplier +
        ' ' +
        0.5 * GRID_UNIT * multiplier +
        ' ' +
        GRID_UNIT * multiplier +
        ' ' +
        4 * GRID_UNIT * multiplier +
        ' ' +
        4 * GRID_UNIT * multiplier +
        ' ' +
        4 * GRID_UNIT * multiplier +
        ' h ' +
        4 * GRID_UNIT * multiplier +
        ' c ' +
        3 * GRID_UNIT * multiplier +
        ' 0 ' +
        1.75 * GRID_UNIT * multiplier +
        ' ' +
        -3.5 * GRID_UNIT * multiplier +
        ' ' +
        4 * GRID_UNIT * multiplier +
        ' ' +
        -4 * GRID_UNIT * multiplier +
        ' c ' +
        -2.25 * GRID_UNIT * multiplier +
        ' ' +
        -0.5 * GRID_UNIT * multiplier +
        ' ' +
        -GRID_UNIT * multiplier +
        ' ' +
        -4 * GRID_UNIT * multiplier +
        ' ' +
        -4 * GRID_UNIT * multiplier +
        ' ' +
        -4 * GRID_UNIT * multiplier +
        ' h ' +
        -4 * GRID_UNIT * multiplier +
        ' z';
    BlockSvg.INPUT_SHAPE_OBJECT_WIDTH = 12 * GRID_UNIT * multiplier;
    BlockSvg.INPUT_SHAPE_ROUND =
        'M ' +
        4 * GRID_UNIT * multiplier +
        ',0' +
        ' h ' +
        4 * GRID_UNIT * multiplier +
        ' a ' +
        4 * GRID_UNIT * multiplier +
        ' ' +
        4 * GRID_UNIT * multiplier +
        ' 0 0 1 0 ' +
        8 * GRID_UNIT * multiplier +
        ' h ' +
        -4 * GRID_UNIT * multiplier +
        ' a ' +
        4 * GRID_UNIT * multiplier +
        ' ' +
        4 * GRID_UNIT * multiplier +
        ' 0 0 1 0 -' +
        8 * GRID_UNIT * multiplier +
        ' z';
    BlockSvg.INPUT_SHAPE_ROUND_WIDTH = 12 * GRID_UNIT * multiplier;
    BlockSvg.INPUT_SHAPE_HEIGHT = 8 * GRID_UNIT * multiplier;
    BlockSvg.FIELD_HEIGHT = 8 * GRID_UNIT * multiplier;
    BlockSvg.FIELD_WIDTH = 6 * GRID_UNIT * Math.min(multiplier, 1) + 10 * GRID_UNIT * Math.max(multiplier - 1, 0);
    BlockSvg.FIELD_DEFAULT_CORNER_RADIUS = 4 * GRID_UNIT * multiplier;
    BlockSvg.EDITABLE_FIELD_PADDING = 1.5 * GRID_UNIT * multiplier;
    BlockSvg.BOX_FIELD_PADDING = 2 * GRID_UNIT * multiplier;
    BlockSvg.DROPDOWN_ARROW_PADDING = 2 * GRID_UNIT * multiplier;
    BlockSvg.FIELD_WIDTH_MIN_EDIT = 8 * GRID_UNIT * multiplier;
    BlockSvg.INPUT_AND_FIELD_MIN_X = 12 * GRID_UNIT * multiplier;
    BlockSvg.INLINE_PADDING_Y = 1 * GRID_UNIT * multiplier;
    BlockSvg.SHAPE_IN_SHAPE_PADDING[1][0] = 5 * GRID_UNIT * multiplier;
    BlockSvg.SHAPE_IN_SHAPE_PADDING[1][2] = 5 * GRID_UNIT * multiplier;
    BlockSvg.SHAPE_IN_SHAPE_PADDING[1][3] = 5 * GRID_UNIT * multiplier;
    BlockSvg.SHAPE_IN_SHAPE_PADDING[1][4] = 3 * GRID_UNIT * multiplier;
    BlockSvg.SHAPE_IN_SHAPE_PADDING[2][3] = 4 * GRID_UNIT * multiplier;
    BlockSvg.SHAPE_IN_SHAPE_PADDING[2][4] = 2 * GRID_UNIT * multiplier;
    for (const shape of [0, 1, 2, 3, 4]) {
        BlockSvg.SHAPE_IN_SHAPE_PADDING[3][shape] = 2 * GRID_UNIT * multiplier;
    }
    BlockSvg.SHAPE_IN_SHAPE_PADDING[4][0] = 5 * GRID_UNIT * multiplier;
    BlockSvg.SHAPE_IN_SHAPE_PADDING[4][1] = 4 * GRID_UNIT * multiplier;
    BlockSvg.SHAPE_IN_SHAPE_PADDING[4][2] = 5 * GRID_UNIT * multiplier;
    BlockSvg.SHAPE_IN_SHAPE_PADDING[4][3] = 5 * GRID_UNIT * multiplier;
    BlockSvg.SHAPE_IN_SHAPE_PADDING[4][4] = 3 * GRID_UNIT * multiplier;

    ScratchBlocks.FieldDropdown.prototype.positionArrow = function (position) {
        const arrowHeight = 12;
        this.arrowY_ = (BlockSvg.FIELD_HEIGHT - arrowHeight) / 2 + 1;
        return originalDropdownObject.call(this, position);
    };

    BlockSvg.CORNER_RADIUS = (1 * GRID_UNIT * cornerSize * 100) / 100;

    BlockSvg.TOP_LEFT_CORNER_START = 'm 0,' + BlockSvg.CORNER_RADIUS;

    BlockSvg.TOP_LEFT_CORNER =
        'A ' + BlockSvg.CORNER_RADIUS + ',' + BlockSvg.CORNER_RADIUS + ' 0 0,1 ' + BlockSvg.CORNER_RADIUS + ',0';

    BlockSvg.TOP_RIGHT_CORNER =
        'a ' +
        BlockSvg.CORNER_RADIUS +
        ',' +
        BlockSvg.CORNER_RADIUS +
        ' 0 0,1 ' +
        BlockSvg.CORNER_RADIUS +
        ',' +
        BlockSvg.CORNER_RADIUS;

    BlockSvg.BOTTOM_RIGHT_CORNER =
        ' a ' +
        BlockSvg.CORNER_RADIUS +
        ',' +
        BlockSvg.CORNER_RADIUS +
        ' 0 0,1 -' +
        BlockSvg.CORNER_RADIUS +
        ',' +
        BlockSvg.CORNER_RADIUS;

    BlockSvg.BOTTOM_LEFT_CORNER =
        'a ' +
        BlockSvg.CORNER_RADIUS +
        ',' +
        BlockSvg.CORNER_RADIUS +
        ' 0 0,1 -' +
        BlockSvg.CORNER_RADIUS +
        ',-' +
        BlockSvg.CORNER_RADIUS;

    BlockSvg.INPUT_SHAPE_SQUARE =
        BlockSvg.TOP_LEFT_CORNER_START +
        BlockSvg.TOP_LEFT_CORNER +
        ' h ' +
        (12 * GRID_UNIT * multiplier - 2 * BlockSvg.CORNER_RADIUS) +
        BlockSvg.TOP_RIGHT_CORNER +
        ' v ' +
        (8 * GRID_UNIT * multiplier - 2 * BlockSvg.CORNER_RADIUS) +
        BlockSvg.BOTTOM_RIGHT_CORNER +
        ' h ' +
        (-12 * GRID_UNIT * multiplier + 2 * BlockSvg.CORNER_RADIUS) +
        BlockSvg.BOTTOM_LEFT_CORNER +
        ' z';
    BlockSvg.INPUT_SHAPE_SQUARE_WIDTH = 12 * GRID_UNIT * multiplier;

    BlockSvg.INNER_TOP_LEFT_CORNER =
        ' a ' +
        BlockSvg.CORNER_RADIUS +
        ',' +
        BlockSvg.CORNER_RADIUS +
        ' 0 0,0 -' +
        BlockSvg.CORNER_RADIUS +
        ',' +
        BlockSvg.CORNER_RADIUS;

    BlockSvg.INNER_BOTTOM_LEFT_CORNER =
        'a ' +
        BlockSvg.CORNER_RADIUS +
        ',' +
        BlockSvg.CORNER_RADIUS +
        ' 0 0,0 ' +
        BlockSvg.CORNER_RADIUS +
        ',' +
        BlockSvg.CORNER_RADIUS;

    BlockSvg.TOP_RIGHT_CORNER_DEFINE_HAT =
        'a ' +
        BlockSvg.DEFINE_HAT_CORNER_RADIUS +
        ',' +
        BlockSvg.DEFINE_HAT_CORNER_RADIUS +
        ' 0 0,1 ' +
        BlockSvg.DEFINE_HAT_CORNER_RADIUS +
        ',' +
        BlockSvg.DEFINE_HAT_CORNER_RADIUS +
        ' v ' +
        (1 * GRID_UNIT - BlockSvg.CORNER_RADIUS);

    BlockSvg.STATEMENT_INPUT_INNER_SPACE = 2.8 * GRID_UNIT - 0.9 * GRID_UNIT * cornerSize;
};

const updateAllBlocks = (ScratchBlocks, vm, workspace) => {
    const eventsOriginallyEnabled = ScratchBlocks.Events.isEnabled();
    ScratchBlocks.Events.disable();

    if (workspace) {
        if (vm.editingTarget) {
            vm.emitWorkspaceUpdate();
        }
        const flyout = workspace.getFlyout();
        if (flyout) {
            const flyoutWorkspace = flyout.getWorkspace();
            ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(
                ScratchBlocks.Xml.workspaceToDom(flyoutWorkspace),
                flyoutWorkspace
            );
            workspace.getToolbox().refreshSelection();
            workspace.toolboxRefreshEnabled_ = true;
        }
    }

    if (eventsOriginallyEnabled) ScratchBlocks.Events.enable();
};

const applyBlockShapeAndUpdate = (ScratchBlocks, vm, workspace, shape) => {
    applyBlockShape(ScratchBlocks, shape);
    updateAllBlocks(ScratchBlocks, vm, workspace);
};

export {
    defaultBlockShape,
    BLOCK_SHAPE_PRESETS,
    getBlockShape,
    applyBlockShape,
    updateAllBlocks,
    applyBlockShapeAndUpdate
};
