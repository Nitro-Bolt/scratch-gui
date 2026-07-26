import {Theme} from '../lib/themes/index.js';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {closeEditorSettingsModal} from '../reducers/modals.js';
import EditorSettingsModalComponent from '../components/nb-editor-settings-modal/editor-settings-modal.jsx';
import {setTheme} from '../reducers/theme.js';

class NBEditorSettingsModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClose'
        ]);
    }

    handleClose () {
        this.props.onClose();
    }

    render () {
        return (
            <EditorSettingsModalComponent
                onClose={this.handleClose}
                isRtl={this.props.isRtl}
            />
        );
    }
}

NBEditorSettingsModal.propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    intl: intlShape,
    isRtl: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    prefs: PropTypes.any,
    setTheme: PropTypes.func.isRequired,
    theme: PropTypes.instanceOf(Theme)
};

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl,
    theme: state.scratchGui.theme.theme,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    setTheme: theme => dispatch(setTheme(theme)),
    onClose: () => dispatch(closeEditorSettingsModal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBEditorSettingsModal);
