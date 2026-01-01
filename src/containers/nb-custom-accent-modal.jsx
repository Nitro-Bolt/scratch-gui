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
            'handleAddGradientColor',
            'handleClose',
            'handleChangeGradient',
            'handleChangeGradientColorColor',
            'handleChangeGradientColorPosition',
            'handleChangeGradientDirection',
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
            gradientDirection: '90',
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

    handleChangeGradientDirection (e) {
        this.setState({
            gradientDirection: e.target.value
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
            gradient: this.state.isGradient ? {
                colors: this.state.gradientColors,
                direction: this.state.gradientDirection
            } : null,
            isGradient: this.state.isGradient,
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
        const theme = this.props.theme.set('accent', ACCENT_ORANGE);
        this.props.setTheme(theme);
        persistTheme(theme);
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
            gradientColors: accent.gradient?.colors ?? [
                {
                    color: '#855cd6',
                    position: 0
                },
                {
                    color: '#4c97ff',
                    position: 100
                }
            ],
            gradientDirection: accent.gradient?.direction ?? '90',
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
                gradientDirection={this.state.gradientDirection}
                isGradient={this.state.isGradient}
                isRtl={this.props.isRtl}
                loadAccentIntoCreate={this.loadAccentIntoCreate}
                name={this.state.name}
                onAddGradientColor={this.handleAddGradientColor}
                onClose={this.handleClose}
                onChangeGradient={this.handleChangeGradient}
                onChangeGradientColorColor={this.handleChangeGradientColorColor}
                onChangeGradientColorPosition={this.handleChangeGradientColorPosition}
                onChangeGradientDirection={this.handleChangeGradientDirection}
                onChangeName={this.handleChangeName}
                onChangePrimaryColor={this.handleChangePrimaryColor}
                onChangeSecondaryColor={this.handleChangeSecondaryColor}
                onChangeTertiaryColor={this.handleChangeTertiaryColor}
                onDeleteGradientColor={this.handleDeleteGradientColor}
                onOk={this.handleOk}
                onSetThemeToDefault={this.handleSetThemeToDefault}
                onSwitchToCreate={this.handleSwitchToCreate}
                onSwitchToManage={this.handleSwitchToManage}
                primaryColor={this.state.primaryColor}
                secondaryColor={this.state.secondaryColor}
                tertiaryColor={this.state.tertiaryColor}
                tab={this.state.tab}
            />
        );
    }
}

NBCustomAccentModal.propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    intl: intlShape,
    isRtl: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
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
    onClose: () => dispatch(closeCustomAccentModal()),
    onOk: theme => dispatch(setTheme(theme))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBCustomAccentModal);
