import React from 'react';
import {connect} from "react-redux";
import {setMode} from "../reducers/modeReducer";

const Mode = props => (
    <div>
        {
            props.mode === 'night' ?
                <button className="ui inverted yellow button" onClick={() => props.setMode('day')}>Day Mode</button> :
                <button className="ui black basic button" onClick={() => props.setMode('night')}>Night Mode</button>
        }
    </div>
);

const mapStateToProps = state => ({
    mode: state.mode,
});

const mapDispatchToProps = dispatch => ({
    setMode: mode => dispatch(setMode(mode))
});

export default connect(mapStateToProps, mapDispatchToProps)(Mode);