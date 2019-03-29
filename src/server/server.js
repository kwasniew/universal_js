import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import Home from '../shared/pages/Home';
import { StaticRouter } from "react-router-dom";
import Layout from '../shared/Layout';

const app = express();

app.use(express.static(__dirname));

const template = content => `
       <html>
            <head>
                <title>Universal React</title>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
                  />
            </head>
            <body>
                <div id="root">${content}</div>
                <script src="client.js"></script>
            </body>
        </html>
`;

app.get('*', (req, res) => {
    const context = {};
    const content = renderToString(<StaticRouter location={req.url} context={context}><Layout/></StaticRouter>);

    if(context.url) {
        return res.redirect(context.url);
    }
    if(context.status) {
        res.status(context.status);
    }

    res.send(template(content));
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});