import api from '../api';

const FETCH_MESSAGES = 'fetch_messages';

export default (state = [], action) => {
    switch (action.type) {
        case FETCH_MESSAGES:
            return action.payload;
        default:
            return state;
    }
};

export const fetchMessages = () =>  dispatch => {
    return api.fetchMessages()
        .then(body => dispatch({type: FETCH_MESSAGES, payload: body}));
};