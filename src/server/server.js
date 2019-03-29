import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter, matchPath } from "react-router-dom";
import routes from '../shared/routes';
import Layout from '../shared/Layout';
import {Provider} from "react-redux";
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reducer from '../shared/reducers';
import {setMode} from '../shared/reducers/modeReducer';
import serialize from 'serialize-javascript';

const app = express();

app.use(express.static(__dirname));

const template = (content, state) => `
       <html>
            <head>
                <title>Universal React</title>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
                  />
                  <style>
                       .night {
                           background-color: lightgray;
                       }
                       div + div {
                        margin-top: 3em;
                       }
                  </style>
            </head>
            <body>
                <div id="root">${content}</div>
                <script>
                    window.INITIAL_STATE = ${serialize(state)}
                </script>
                <script src="client.js"></script>
            </body>
        </html>
`;

app.get('*', async (req, res) => {
    const context = {};
    const store = createStore(reducer, {}, applyMiddleware(thunk));

    store.dispatch(setMode('night'));
    await Promise.all(routes
        .filter(route => matchPath(req.url, route) && route.component.loadData)
        .map(route => store.dispatch(route.component.loadData(matchPath(req.url, route)))));

    const content = renderToString(
        <Provider store={store}>
            <StaticRouter location={req.url} context={context}>
                <Layout/>
            </StaticRouter>
        </Provider>
    );

    if(context.url) {
        return res.redirect(context.url);
    }
    if(context.status) {
        res.status(context.status);
    }

    res.send(template(content, store.getState()));
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});