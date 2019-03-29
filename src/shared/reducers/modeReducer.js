const SET_MODE = 'set_mode';

export default (state = 'day', action) => {
    switch (action.type) {
        case SET_MODE:
            return action.payload;
        default:
            return state;
    }
};

export const setMode = (mode) => {
    return {type: SET_MODE, payload: mode}
};