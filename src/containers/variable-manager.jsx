import React from 'react';
import bindAll from 'lodash.bindall';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import VM from 'scratch-vm';
import VariableTab from '../components/variables-tab/variables-tab.jsx';
import PropTypes from 'prop-types';
import {highlightTarget} from '../reducers/targets';

class VariableManager extends React.Component {
    constructor (props) {
        super(props);

        bindAll(this, [
            'reload',
            '_reloadGlobalVariable',
            '_reloadLocalVariable',
            '_handleSpriteHighlighting',
            '_forceReloadLocalVariable'
        ]);

        this.state = {
            globalVariables: {},
            clones: []
        };

        /* State format
        {
          globalVariables: {
            [id]: Variable Object,
            ...
          },
          clones: [
            {
              id: String,
              variables: {
                [id]: Variable Object,
                ...
              }
            },
            ...
          ]
        }
        */
    }

    componentDidMount () {
        this.props.vm.runtime.on('RUNTIME_STEP_START', this.reload);
        this.props.vm.runtime.on('PROJECT_LOADED', this.reload);
        this.props.vm.runtime.on('TOOLBOX_EXTENSIONS_NEED_UPDATE', this.reload);

        this.reload();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.editingTarget.id !== this.props.editingTarget.id) {
            this._forceReloadLocalVariable();
        }
    }

    componentWillUnmount () {
        this.props.vm.runtime.off('RUNTIME_STEP_START', this.reload);
        this.props.vm.runtime.off('PROJECT_LOADED', this.reload);
        this.props.vm.runtime.off(
            'TOOLBOX_EXTENSIONS_NEED_UPDATE',
            this.reload
        );
    }

    _checkEquality (value1, value2) {
        if (!(value1 instanceof Array) || !(value2 instanceof Array)) {
            return value1 === value2;
        }
        if (value1.length !== value2.length) return false;

        for (let i = 0; i < value1.length; i++) {
            if (value1[i] instanceof Array && value2[i] instanceof Array) {
                return this._checkEquality(value1[i], value2[i]);
            }
            if (value1[i] !== value2[i]) return false;
        }
        return true;
    }

    _reloadGlobalVariable () {
        const stage = this.props.stage;
        if (!stage) return;
        const newVariables = stage.variables;
        const oldVariables = this.state.globalVariables;

        if (oldVariables.length !== newVariables.length) {
            console.log(
                'GlobalVariable reloading due to mismatch amount of variables'
            );
            return this.setState({
                globalVariables: structuredClone(stage.variables)
            });
        }

        for (const id in newVariables) {
            const varToCheck = oldVariables[id];

            if (!varToCheck) {
                console.log(
                    'GlobalVariable reloading due to previously non-existent variable (may be inaccurate, idk why)'
                );
                return this.setState({
                    globalVariables: structuredClone(stage.variables)
                });
            }

            if (
                varToCheck.name !== newVariables[id].name ||
                !this._checkEquality(varToCheck.value, newVariables[id].value)
            ) {
                console.log(
                    'GlobalVariable reloading due to mismatch variable name and/or value'
                );
                return this.setState({
                    globalVariables: structuredClone(stage.variables)
                });
            }
        }
    }

    _reloadLocalVariable () {
        const clones = this.props.sprite.clones.map(({id, variables}) => ({
            id: id,
            variables: variables
        }));

        if (this.state.clones.length !== clones.length) {
            console.log(
                'LocalVariable reloading due to mismatch amount of clones'
            );
            return this.setState({
                clones: structuredClone(clones)
            });
        }

        for (let i = 0; i < clones.length; i++) {
            const newVariables = clones[i].variables;
            const oldClones = this.state.clones[i];
            const oldVariables = oldClones?.variables;

            if (!oldClones || !oldVariables) {
                console.log(
                    'LocalVariable reloading due to previously non-existent variable'
                );
                return this.setState({
                    clones: structuredClone(clones)
                });
            }

            if (oldVariables.length !== newVariables.length) {
                console.log(
                    'LocalVariable reloading due to previously non-existent variable'
                );
                return this.setState({
                    clones: structuredClone(clones)
                });
            }

            for (const id in newVariables) {
                const varToCheck = oldVariables[id];

                if (!varToCheck) {
                    console.log(
                        'LocalVariable reloading due to previously non-existent variable'
                    );
                    return this.setState({
                        clones: structuredClone(clones)
                    });
                }

                if (
                    varToCheck.name !== newVariables[id].name ||
                    !this._checkEquality(
                        varToCheck.value,
                        newVariables[id].value
                    )
                ) {
                    console.log(
                        'LocalVariable reloading due to mismatch variable name and/or value'
                    );
                    return this.setState({
                        clones: structuredClone(clones)
                    });
                }
            }
        }
    }

    _forceReloadLocalVariable () {
        const clones = this.props.sprite.clones.map(({id, variables}) => ({
            id: id,
            variables: variables
        }));

        this.setState({
            clones: structuredClone(clones)
        });
    }

    reload () {
        try {
            this._reloadGlobalVariable();
            this._reloadLocalVariable();
        } catch (e) {
            console.error(e);
        }
    }

    _handleSpriteHighlighting (id) {
        this.props.dispatchHighlightTarget(id);
    }

    handleNameChange (event, variable) {
        console.log(event.target.value, variable);
    }

    render () {
        // The `clones` array needs to be formatted
        // because it have a lot of other useless propeties that should not be copied to State
        // But on first load, the formating won't run so we need to pass the `clones` object directly
        // IDK why `globalVariables` aren't affected by this and IDC, it works
        const isClonesFormatted = this.state.clones.length > 0;
        return (
            <VariableTab
                isRtl={this.props.isRtl}
                globalVariables={this.state.globalVariables}
                clones={
                    isClonesFormatted ?
                        this.state.clones :
                        this.props.editingTarget.sprite.clones
                }
                handleSpriteHighlighting={this._handleSpriteHighlighting}
                onNameChange={this.handleNameChange}
                intl={this.props.intl}
                isStage={this.props.editingTarget.isStage}
            />
        );
    }
}

VariableManager.propTypes = {
    editingTarget: {
        [PropTypes.string]: {
            id: PropTypes.string,
            variables: PropTypes.shape({
                [PropTypes.string]: PropTypes.shape({
                    id: PropTypes.string,
                    value: PropTypes.string
                })
            }),
            isStage: PropTypes.bool
        }
    },
    stage: {
        variables: {
            [PropTypes.string]: PropTypes.shape({
                id: PropTypes.string,
                value: PropTypes.string
            })
        }
    },
    intl: intlShape,
    isRtl: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired,
    sprite: {
        clones: PropTypes.array
    },
    dispatchHighlightTarget: PropTypes.func
};

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl,
    stage: state.scratchGui.targets.stage,
    editingTarget: state.scratchGui.vm.editingTarget,
    sprite: state.scratchGui.vm.editingTarget.sprite
});

const mapDispatchToProps = dispatch => ({
    dispatchHighlightTarget: id => dispatch(highlightTarget(id))
});

export default errorBoundaryHOC('Variable Manager')(
    connect(mapStateToProps, mapDispatchToProps)(VariableManager)
);
