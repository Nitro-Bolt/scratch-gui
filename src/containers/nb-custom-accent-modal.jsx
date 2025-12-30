import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {closeCustomAccentModal} from '../reducers/modals.js';
import CustomAccentModalComponent from '../components/nb-custom-accent-modal/custom-accent-modal.jsx';
import {setTheme} from '../reducers/theme.js';

class NBCustomAccentModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChangeGradient',
            'handleClose',
            'handleOk'
        ]);
        this.state = {
            isGradient: false,
            primaryColor: '#ff5726',
            secondaryColor: '#f2735a'
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
    
    handleOk () {
        setTheme()
        this.props.onClose();
    }

    render () {
        return (
            <CustomAccentModalComponent
                isGradient={this.state.isGradient}
                onClose={this.handleClose}
                onChangeGradient={this.handleChangeGradient}
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
    onClose: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeCustomAccentModal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBCustomAccentModal);
