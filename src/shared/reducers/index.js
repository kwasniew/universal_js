import {combineReducers} from 'redux';
import modeReducer from './modeReducer';

export default combineReducers({
    mode: modeReducer
});