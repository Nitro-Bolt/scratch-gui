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
import PaintGradientModal from '../components/nb-paint-gradient-modal/paint-gradient-modal.jsx';

class PaintEditorWrapper extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleUpdateImage',
            'handleUpdateName',
            'handleUpdateFonts',
            'handleOpenCustomGradient',
            'handleChangeCustomGradient',
            'handleCancelCustomGradient',
            'handleCloseCustomGradient',
            'fontInlineFn'
        ]);
        this.state = {
            fonts: this.props.vm.runtime.fontManager.getFonts(),
            customGradient: null,
            originalCustomGradient: null,
            customGradientCallback: null
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
            this.props.canvasSizeMultiplier !== nextProps.canvasSizeMultiplier ||
            this.props.noSwapButton !== nextProps.noSwapButton ||
            this.props.noCutButton !== nextProps.noCutButton ||
            this.state.fonts !== nextState.fonts ||
            this.state.customGradient !== nextState.customGradient;
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
        this.props.vm.renameCostume(this.props.selectedCostumeIndex, name);
    }
    handleUpdateImage (isVector, image, rotationCenterX, rotationCenterY) {
        if (isVector) {
            this.props.vm.updateSvg(
                this.props.selectedCostumeIndex,
                image,
                rotationCenterX,
                rotationCenterY);
        } else {
            this.props.vm.updateBitmap(
                this.props.selectedCostumeIndex,
                image,
                rotationCenterX,
                rotationCenterY,
                2 /* bitmapResolution */);
        }
    }
    handleOpenCustomGradient (customGradient, onChange) {
        this.setState({
            customGradient: customGradient,
            originalCustomGradient: customGradient,
            customGradientCallback: onChange
        });
    }
    handleChangeCustomGradient (customGradient) {
        this.setState({customGradient});
        if (this.state.customGradientCallback) this.state.customGradientCallback(customGradient);
    }
    handleCloseCustomGradient () {
        if (this.state.customGradientCallback && this.state.customGradient) {
            this.state.customGradientCallback(this.state.customGradient);
        }
        this.setState({
            customGradient: null,
            originalCustomGradient: null,
            customGradientCallback: null
        });
    }
    handleCancelCustomGradient () {
        if (this.state.customGradientCallback && this.state.originalCustomGradient) {
            this.state.customGradientCallback(this.state.originalCustomGradient);
        }
        this.setState({
            customGradient: null,
            originalCustomGradient: null,
            customGradientCallback: null
        });
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
        const costume = vm.getCostume(selectedCostumeIndex);
        return (
            <React.Fragment>
                <PaintEditor
                    {...componentProps}
                    image={this.props.imageFormat === 'svg' ? sanitizeSvg.sanitizeSvgText(costume) : costume}
                    onOpenCustomGradient={this.handleOpenCustomGradient}
                    onUpdateImage={this.handleUpdateImage}
                    onUpdateName={this.handleUpdateName}
                    fontInlineFn={this.fontInlineFn}
                    theme={this.props.theme.isDark() ? 'dark' : 'light'}
                    customFonts={this.state.fonts}
                    width={this.props.customStageSize.width}
                    height={this.props.customStageSize.height}
                    nudgeMultiplier={this.props.nudgeMultiplier}
                    canvasSizeMultiplier={this.props.canvasSizeMultiplier}
                    noSwapButton={this.props.noSwapButton}
                    noCutButton={this.props.noCutButton}
                />
                {this.state.customGradient && (
                    <PaintGradientModal
                        gradient={this.state.customGradient}
                        onChange={this.handleChangeCustomGradient}
                        onCancel={this.handleCancelCustomGradient}
                        onOk={this.handleCloseCustomGradient}
                    />
                )}
            </React.Fragment>
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
    canvasSizeMultiplier: PropTypes.number,
    noSwapButton: PropTypes.bool,
    noCutButton: PropTypes.bool,
    theme: PropTypes.instanceOf(Theme),
    name: PropTypes.string,
    rotationCenterX: PropTypes.number,
    rotationCenterY: PropTypes.number,
    rtl: PropTypes.bool,
    selectedCostumeIndex: PropTypes.number.isRequired,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = (state, {selectedCostumeIndex}) => {
    const targetId = state.scratchGui.vm.editingTarget.id;
    const sprite = state.scratchGui.vm.editingTarget.sprite;
    // Make sure the costume index doesn't go out of range.
    const index = selectedCostumeIndex < sprite.costumes.length ?
        selectedCostumeIndex : sprite.costumes.length - 1;
    const costume = state.scratchGui.vm.editingTarget.sprite.costumes[index];
    return {
        customStageSize: state.scratchGui.customStageSize,
        name: costume && costume.name,
        nudgeMultiplier: state.scratchGui.preferences['paint-nudge-multiplier'],
        canvasSizeMultiplier: state.scratchGui.preferences['paint-canvas-size-multiplier'],
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
