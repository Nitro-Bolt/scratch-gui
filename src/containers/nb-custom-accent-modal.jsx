import {Theme} from '../lib/themes/index.js';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {closeCustomAccentModal} from '../reducers/modals.js';
import CustomAccentModalComponent from '../components/nb-custom-accent-modal/custom-accent-modal.jsx';
import {setTheme} from '../reducers/theme.js';
import {persistTheme} from '../lib/themes/themePersistance.js';

class NBCustomAccentModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChangeGradient',
            'handleClose',
            'handleChangePrimaryColor',
            'handleChangeSecondaryColor',
            'handleOk'
        ]);
        this.state = {
            isGradient: !!this.props.theme.accent.isGradient,
            primaryColor: this.props.theme.accent.primaryColor ?? '#ff5726',
            secondaryColor: this.props.theme.accent.secondaryColor ?? '#f2735a'
        };
    }

    handleChangeGradient (e) {
        this.setState({
            isGradient: e.target.checked
        });
    }
    
    handleClose () {
        this.props.onClose();
    }
    
    handleChangePrimaryColor (e) {
        this.setState({
            primaryColor: e.target.value
        });
    }
    
    handleChangeSecondaryColor (e) {
        this.setState({
            secondaryColor: e.target.value
        });
    }
    
    handleOk () {
        const theme = this.props.theme.set('accent', {
            primaryColor: this.state.primaryColor,
            secondaryColor: this.state.secondaryColor,
            isGradient: this.state.isGradient
        });
        this.props.onOk(theme);
        this.props.onClose();
        persistTheme(theme);
    }

    render () {
        return (
            <CustomAccentModalComponent
                isGradient={this.state.isGradient}
                onClose={this.handleClose}
                onChangeGradient={this.handleChangeGradient}
                onChangePrimaryColor={this.handleChangePrimaryColor}
                onChangeSecondaryColor={this.handleChangeSecondaryColor}
                onOk={this.handleOk}
                primaryColor={this.state.primaryColor}
                secondaryColor={this.state.secondaryColor}
            />
        );
    }
}

NBCustomAccentModal.propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    intl: intlShape,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    theme: PropTypes.instanceOf(Theme)
};

const mapStateToProps = state => ({
    theme: state.scratchGui.theme.theme,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeCustomAccentModal()),
    onOk: theme => dispatch(setTheme(theme))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBCustomAccentModal);
