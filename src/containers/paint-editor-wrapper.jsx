import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';
import PaintEditor from '../lib/tw-scratch-paint';
import {inlineSvgFonts, sanitizeSvg} from '@turbowarp/scratch-svg-renderer';
import ErrorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import {openFontsModal} from '../reducers/modals';

import {connect} from 'react-redux';
import {Theme} from '../lib/themes/index.js';

class PaintEditorWrapper extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleUpdateImage',
            'handleUpdateName',
            'handleUpdateFonts',
            'fontInlineFn'
        ]);
        this.state = {
            fonts: this.props.vm.runtime.fontManager.getFonts()
        };
    }
    componentDidMount () {
        this.props.vm.runtime.fontManager.on('change', this.handleUpdateFonts);
    }
    shouldComponentUpdate (nextProps, nextState) {
        return this.props.imageId !== nextProps.imageId ||
            this.props.rtl !== nextProps.rtl ||
            this.props.name !== nextProps.name ||
            this.props.theme !== nextProps.theme ||
            this.props.customStageSize !== nextProps.customStageSize ||
            this.props.nudgeMultiplier !== nextProps.nudgeMultiplier ||
            this.props.noSwapButton !== nextProps.noSwapButton ||
            this.props.noCutButton !== nextProps.noCutButton ||
            this.state.fonts !== nextState.fonts;
    }
    componentWillUnmount () {
        this.props.vm.runtime.fontManager.off('change', this.handleUpdateFonts);
    }
    handleUpdateFonts () {
        this.setState({
            fonts: this.props.vm.runtime.fontManager.getFonts()
        });
    }
    handleUpdateName (name) {
        const target = this.props.vm.runtime.getTargetById(this.props.targetId);
        if (!target) return;
        this.props.vm.renameCostume(
            this.props.selectedCostumeIndex,
            name,
            true,
            target
        );
    }
    handleUpdateImage (isVector, image, rotationCenterX, rotationCenterY) {
        const target = this.props.vm.runtime.getTargetById(this.props.targetId);
        if (!target) return;
        if (isVector) {
            this.props.vm.updateSvg(
                this.props.selectedCostumeIndex,
                image,
                rotationCenterX,
                rotationCenterY,
                true,
                target);
        } else {
            this.props.vm.updateBitmap(
                this.props.selectedCostumeIndex,
                image,
                rotationCenterX,
                rotationCenterY,
                2 /* bitmapResolution */,
                true,
                target);
        }
    }
    fontInlineFn (svgString) {
        return inlineSvgFonts(svgString, this.props.vm.renderer.customFonts);
    }
    render () {
        if (!this.props.imageId) return null;
        const {
            selectedCostumeIndex,
            vm,
            ...componentProps
        } = this.props;
        const target = vm.runtime.getTargetById(this.props.targetId);
        if (!target) return null;
        const costume = vm.getCostume(selectedCostumeIndex, target);
        return (
            <PaintEditor
                {...componentProps}
                image={this.props.imageFormat === 'svg' ? sanitizeSvg.sanitizeSvgText(costume) : costume}
                onUpdateImage={this.handleUpdateImage}
                onUpdateName={this.handleUpdateName}
                fontInlineFn={this.fontInlineFn}
                theme={this.props.theme.isDark() ? 'dark' : 'light'}
                customFonts={this.state.fonts}
                width={this.props.customStageSize.width}
                height={this.props.customStageSize.height}
                nudgeMultiplier={this.props.nudgeMultiplier}
                noSwapButton={this.props.noSwapButton}
                noCutButton={this.props.noCutButton}
            />
        );
    }
}

PaintEditorWrapper.propTypes = {
    customStageSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    onManageFonts: PropTypes.func.isRequired,
    imageFormat: PropTypes.string.isRequired,
    imageId: PropTypes.string.isRequired,
    nudgeMultiplier: PropTypes.number,
    noSwapButton: PropTypes.bool,
    noCutButton: PropTypes.bool,
    theme: PropTypes.instanceOf(Theme),
    name: PropTypes.string,
    rotationCenterX: PropTypes.number,
    rotationCenterY: PropTypes.number,
    rtl: PropTypes.bool,
    selectedCostumeIndex: PropTypes.number.isRequired,
    targetId: PropTypes.string.isRequired,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = (state, {selectedCostumeIndex, targetId}) => {
    const target = state.scratchGui.vm.runtime.getTargetById(targetId);
    const sprite = target.sprite;
    // Make sure the costume index doesn't go out of range.
    const index = selectedCostumeIndex < sprite.costumes.length ?
        selectedCostumeIndex : sprite.costumes.length - 1;
    const costume = sprite.costumes[index];
    return {
        customStageSize: state.scratchGui.customStageSize,
        name: costume && costume.name,
        nudgeMultiplier: state.scratchGui.preferences['paint-nudge-multiplier'],
        noSwapButton: state.scratchGui.preferences['paint-no-swap-button'],
        noCutButton: state.scratchGui.preferences['paint-no-cut-button'],
        rotationCenterX: costume && costume.rotationCenterX,
        rotationCenterY: costume && costume.rotationCenterY,
        imageFormat: costume && costume.dataFormat,
        imageId: targetId && `${targetId}${costume.skinId}`,
        rtl: state.locales.isRtl,
        selectedCostumeIndex: index,
        theme: state.scratchGui.theme.theme,
        vm: state.scratchGui.vm,
        zoomLevelId: targetId
    };
};

const mapDispatchToProps = dispatch => ({
    onManageFonts: () => dispatch(openFontsModal())
});

export default ErrorBoundaryHOC('paint')(connect(
    mapStateToProps,
    mapDispatchToProps
)(PaintEditorWrapper));
