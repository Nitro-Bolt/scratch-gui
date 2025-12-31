import {ACCENT_ORANGE, Theme} from '../lib/themes/index.js';
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
            'handleClose',
            'handleChangeGradient',
            'handleChangeName',
            'handleChangePrimaryColor',
            'handleChangeSecondaryColor',
            'handleChangeTertiaryColor',
            'handleOk',
            'handleSetThemeToDefault',
            'handleSwitchToCreate',
            'handleSwitchToManage',
            'loadAccentIntoCreate'
        ]);
        this.state = {
            isGradient: false,
            name: '',
            primaryColor: '#855cd6',
            secondaryColor: '#714eb7',
            tertiaryColor: '#0fbd8c',
            tab: 'create'
        };
    }

    handleClose () {
        this.props.onClose();
    }

    handleChangeGradient (e) {
        this.setState({
            isGradient: e.target.checked
        });
    }

    handleChangeName (e) {
        this.setState({
            name: e.target.value
        });
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

    handleChangeTertiaryColor (e) {
        this.setState({
            tertiaryColor: e.target.value
        });
    }
    
    handleOk () {
        if (this.state.name.trim().length === 0) return;
        const accent = {
            name: this.state.name,
            primaryColor: this.state.primaryColor,
            secondaryColor: this.state.secondaryColor,
            tertiaryColor: this.state.tertiaryColor,
            isGradient: this.state.isGradient
        };
        const theme = this.props.theme.set('accent', accent);
        let accentsJSON = JSON.parse(localStorage.getItem('nb:custom-accents'));
        accentsJSON = accentsJSON.filter(value => value.name !== this.state.name);
        accentsJSON.push(accent);
        localStorage.setItem('nb:custom-accents', JSON.stringify(accentsJSON));
        this.props.onOk(theme);
        this.props.onClose();
        persistTheme(theme);
    }

    handleSetThemeToDefault () {
        this.props.setTheme(this.props.theme.set('accent', ACCENT_ORANGE));
    }

    handleSwitchToCreate () {
        this.setState({
            tab: 'create'
        });
    }

    handleSwitchToManage () {
        this.setState({
            tab: 'manage'
        });
    }

    loadAccentIntoCreate (accent) {
        this.setState({
            isGradient: accent.isGradient,
            name: accent.name,
            primaryColor: accent.primaryColor,
            secondaryColor: accent.secondaryColor,
            tertiaryColor: accent.tertiaryColor
        });
    }

    render () {
        return (
            <CustomAccentModalComponent
                isGradient={this.state.isGradient}
                loadAccentIntoCreate={this.loadAccentIntoCreate}
                name={this.state.name}
                onClose={this.handleClose}
                onChangeGradient={this.handleChangeGradient}
                onChangeName={this.handleChangeName}
                onChangePrimaryColor={this.handleChangePrimaryColor}
                onChangeSecondaryColor={this.handleChangeSecondaryColor}
                onChangeTertiaryColor={this.handleChangeTertiaryColor}
                onOk={this.handleOk}
                onSwitchToCreate={this.handleSwitchToCreate}
                onSwitchToManage={this.handleSwitchToManage}
                primaryColor={this.state.primaryColor}
                secondaryColor={this.state.secondaryColor}
                setThemeToDefault={this.handleSetThemeToDefault}
                tertiaryColor={this.state.tertiaryColor}
                tab={this.state.tab}
            />
        );
    }
}

NBCustomAccentModal.propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    intl: intlShape,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    setTheme: PropTypes.func.isRequired,
    theme: PropTypes.instanceOf(Theme)
};

const mapStateToProps = state => ({
    theme: state.scratchGui.theme.theme,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    setTheme: theme => dispatch(setTheme(theme)),
    onClose: () => dispatch(closeCustomAccentModal()),
    onOk: theme => dispatch(setTheme(theme))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBCustomAccentModal);
