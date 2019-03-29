import {combineReducers} from 'redux';
import modeReducer from './modeReducer';
import messagesReducer from './messagesReducer';
import messageReducer from './messageReducer';

export default combineReducers({
    mode: modeReducer,
    messages: messagesReducer,
    message: messageReducer
});