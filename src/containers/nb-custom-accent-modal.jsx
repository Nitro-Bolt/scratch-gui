import {ACCENT_ORANGE, Theme} from '../lib/themes/index.js';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {closeCustomAccentModal} from '../reducers/modals.js';
import CustomAccentModalComponent, { gradientColorsToCSS } from '../components/nb-custom-accent-modal/custom-accent-modal.jsx';
import {setTheme} from '../reducers/theme.js';
import {persistTheme} from '../lib/themes/themePersistance.js';

class NBCustomAccentModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleAddGradientColor',
            'handleClose',
            'handleChangeGradient',
            'handleChangeGradientColorColor',
            'handleChangeGradientColorPosition',
            'handleChangeName',
            'handleChangePrimaryColor',
            'handleChangeSecondaryColor',
            'handleChangeTertiaryColor',
            'handleDeleteGradientColor',
            'handleOk',
            'handleSetThemeToDefault',
            'handleSwitchToCreate',
            'handleSwitchToManage',
            'loadAccentIntoCreate'
        ]);
        this.state = {
            isGradient: false,
            gradientColors: [
                {
                    color: '#855cd6',
                    position: 0
                },
                {
                    color: '#4c97ff',
                    position: 100
                }
            ],
            name: '',
            primaryColor: '#855cd6',
            secondaryColor: '#714eb7',
            tertiaryColor: '#0fbd8c',
            tab: 'create'
        };
    }

    handleAddGradientColor () {
        this.setState({
            gradientColors: [
                ...this.state.gradientColors,
                {
                    color: '#4c97ff',
                    position: 100
                }
            ]
        });
    }

    handleClose () {
        this.props.onClose();
    }

    handleChangeGradient (e) {
        this.setState({
            isGradient: e.target.checked
        });
    }

    handleChangeGradientColorColor (e, i) {
        const colors = [...this.state.gradientColors];
        colors[i].color = e.target.value;
        this.setState({
            gradientColors: colors
        });
    }

    handleChangeGradientColorPosition (e, i) {
        const colors = [...this.state.gradientColors];
        if (e.target.value > 100) colors[i].position = 100;
        else if (e.target.value < 0) colors[i].position = 0;
        else colors[i].position = e.target.value;
        this.setState({
            gradientColors: colors
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

    handleDeleteGradientColor (i) {
        if (this.state.gradientColors.length <= 2) return;
        this.setState({
            gradientColors: this.state.gradientColors.filter((_, index) => i !== index)
        });
    }
    
    handleOk () {
        if (this.state.name.trim().length === 0) return;
        const accent = {
            gradient: this.state.isGradient ? gradientColorsToCSS(this.state.gradientColors) : null,
            name: this.state.name,
            primaryColor: this.state.primaryColor,
            secondaryColor: this.state.secondaryColor,
            tertiaryColor: this.state.tertiaryColor
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
            gradient: accent.gradient,
            name: accent.name,
            primaryColor: accent.primaryColor,
            secondaryColor: accent.secondaryColor,
            tertiaryColor: accent.tertiaryColor
        });
    }

    render () {
        return (
            <CustomAccentModalComponent
                gradientColors={this.state.gradientColors}
                isGradient={this.state.isGradient}
                loadAccentIntoCreate={this.loadAccentIntoCreate}
                name={this.state.name}
                onAddGradientColor={this.handleAddGradientColor}
                onClose={this.handleClose}
                onChangeGradient={this.handleChangeGradient}
                onChangeGradientColorColor={this.handleChangeGradientColorColor}
                onChangeGradientColorPosition={this.handleChangeGradientColorPosition}
                onChangeName={this.handleChangeName}
                onChangePrimaryColor={this.handleChangePrimaryColor}
                onChangeSecondaryColor={this.handleChangeSecondaryColor}
                onChangeTertiaryColor={this.handleChangeTertiaryColor}
                onDeleteGradientColor={this.handleDeleteGradientColor}
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
