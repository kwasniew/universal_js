import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import Home from '../shared/pages/Home';

const app = express();

app.use(express.static(__dirname));

const template = content => `
       <html>
            <head>
                <title>Universal React</title>
            </head>
            <body>
                <div id="root">${content}</div>
                <script src="client.js"></script>
            </body>
        </html>
`;

app.get('*', (req, res) => {
    const content = renderToString(<Home/>);

    res.send(template(content));
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});