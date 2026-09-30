import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import EffectParamsModalComponent from '../components/nb-effect-params-modal/effect-params-modal.jsx';
import {
    submitEffectParams,
    cancelEffectParams
} from '../lib/nb-effect-params';

const EffectParamsModal = props => {
    if (!props.request) return null;
    return (
        <EffectParamsModalComponent
            key={props.requestId}
            request={props.request}
            onCancel={props.onCancel}
            onSubmit={props.onSubmit}
        />
    );
};

EffectParamsModal.propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    request: PropTypes.object,
    requestId: PropTypes.number
};

const mapStateToProps = state => ({
    request: state.scratchGui.nbEffectParams.request,
    requestId: state.scratchGui.nbEffectParams.requestId
});

const mapDispatchToProps = dispatch => ({
    onSubmit: values => submitEffectParams(dispatch, values),
    onCancel: () => cancelEffectParams(dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(EffectParamsModal);
