import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from "react-router-dom";
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import reducer from '../shared/reducers';

import Layout from '../shared/Layout';

const store = createStore(reducer, window.INITIAL_STATE);

ReactDOM.hydrate(
    <Provider store={store}>
        <BrowserRouter>
            <Layout/>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root'));