import {combineReducers} from 'redux';
import modeReducer from './modeReducer';
import messagesReducer from './messagesReducer';

export default combineReducers({
    mode: modeReducer,
    messages: messagesReducer
});