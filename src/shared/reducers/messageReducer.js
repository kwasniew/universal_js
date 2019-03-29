import api from '../api';

const FETCH_MESSAGE = 'fetch_message';

export default (state = {}, action) => {
    switch (action.type) {
        case FETCH_MESSAGE:
            return action.payload;
        default:
            return state;
    }
};

export const fetchMessage = id =>  dispatch => {
    return api.fetchMessage(id)
        .then(body => dispatch({type: FETCH_MESSAGE, payload: body}));
};