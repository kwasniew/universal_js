## Universal JS apps

### Definition

Universal JS app = SPA + SSR

Sometimes we call those universal apps "Isomorphic" but since isomorphism
is an established term in Computer Science I'll avoid it here.

### Motivation

Many people reach for Universal JS apps for different reasons:
* to serve HTML for bots that don't speak JS
* to have graceful degradation when JS breaks or is disabled
* to improve performance (from my experience SSR usually
improves time to first meaningful paint but degrades time to interactive)
[Read more](https://aerotwist.com/blog/when-everything-is-important-nothing-is/)

### Complexity

Universal JS looks promising in theory but in practice is a
nest of corner cases. Many people overwhelmed by complexity
of the problem reach for Universal JS frameworks like next.js or after.js.
Some are really [happy](https://twitter.com/ph1/status/1093751398250901504) with them.

But frameworks come with their pre-baked assumptions and sometimes:
* solve more problems than your current problem
* don't solve all of your problems
* make it possible to solve your problem but at a high cost

No matter if you go for the higher level framework it's still
important to understand the underlying concepts.
That's why we'll build a universal React app from scratch
to understand every single step of the process.
We'll see how to make React, React Router, Redux, Express and Parcel
work together.

### Roadmap

Universal JS is a spectrum. We can share:
* views
* routes
* state management
* data fetching

In this tutorial we'll try to share as much as possible to see what's possible.

We'll only add as much code as needed to show the most relevant concepts.

## Universal component

Our app will be developed in 3 folders:
* src/client
* src/server
* src/shared (pages and components)

It will make it easier to learn the concepts and see what parts can be universal/shared
between client and server.

For starters let's try to render one component both on the client and server side.
Since React components require transpilation it means that our Node.js code
will also require transpilation. This is the most significant drawback to me.
Pristine Node.js setup has lightening fast clean startup times,
requires no tooling and is very easy to debug. All those perks are gone
once you start doing SSR with React/JSX.

Initial package.json with all dependencies we gonna use:
```json
{
  "dependencies": {
    "express": "4.16.4",
    "isomorphic-fetch": "2.2.1",
    "react": "16.8.5",
    "react-dom": "16.8.5",
    "react-redux": "6.0.1",
    "react-router": "5.0.0",
    "react-router-dom": "5.0.0",
    "redux": "4.0.1",
    "redux-thunk": "2.3.0",
    "serialize-javascript": "1.6.1"
  },
  "devDependencies": {
    "nodemon": "1.18.10",
    "npm-run-all": "4.1.5",
    "parcel-bundler": "1.12.3"
  }
}
```
Please note we're trying to use as few libraries as possible.

Here's our very basic component we want to render server and client side:

shared/pages/Home.js
```javascript
import React from 'react';

export default () => <h2>Home</h2>;
```

server/server.js
```javascript
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
```
We gonna use ES6 imports everywhere in our codebase since we pay the bundler
tax anyway when we use JSX. In a non-transpiled Node.js codebase I'd use require.

renderToString is the server side way of putting React components into
string. We embed this string into our template.
Please note that template also has a link to client side bundle.


client/client.js
```javascript
import React from 'react';
import ReactDOM from 'react-dom';

import Home from '../shared/pages/Home';

ReactDOM.hydrate(<Home/>, document.getElementById('root'));
```
Here we're using hydrate instead of render since we want React to synchronize
with the backend rendered content.

Finally our build scripts:
```
  "scripts": {
    "dev": "npm-run-all --parallel watch:* start:dev",
    "prod": "npm-run-all build:client build:server start:prod",
    "start:dev": "nodemon build/server.js",
    "start:prod": "node build/server.js",
    "build:server": "parcel build --target node src/server/server.js --out-dir build",
    "build:client": "parcel build src/client/client.js --out-dir build",
    "watch:server": "parcel watch --no-hmr --target node src/server/server.js --out-dir build",
    "watch:client": "parcel watch --no-hmr src/client/client.js --out-dir build"
  }
```

We gonna use 2 main command:
* ```npm run dev```
* ```npm run prod```

Please note that in prod both server and client need to be transpiled
before we start the server.
We use parcel zero-config bundler since it saves us configuration time compared to webpack.
Parcel has a special mode for Node.js that excludes node_modules from bundling.

Test your app with JS enabled and disabled.

## Universal routing

Let's add another page component

shared/pages/Messages.js
```javascript
import React from 'react';

export default () => <h2>Messages</h2>;
```

And a layout with navigation links

shared/Layout.js
```javascript
import React from "react";
import {Link, Switch, Route} from "react-router-dom";
import Home from "./pages/Home";
import Messages from "./pages/Messages";

export default () => (
    <div>
        <h1>Messenger</h1>
        <div>
            <Link to="/">Home</Link>
            <Link to="/messages">Messages</Link>
        </div>
        <Switch>
            <Route path="/" exact component={Home}/>
            <Route path="/messages" component={Messages}/>
        </Switch>
    </div>
)
```

Here we use routes from the React Router.

Now we need to implement client side router

client/client.js
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from "react-router-dom";

import Layout from '../shared/Layout';

ReactDOM.hydrate(<BrowserRouter><Layout/></BrowserRouter>, document.getElementById('root'));
```
We just wrapped everything in a BrowserRouter.

And same thing has to be done server side with a server router called StaticRouter.

server.js
```javascript
import { StaticRouter } from "react-router-dom";
import Layout from '../shared/Layout';

const content = renderToString(<StaticRouter location={req.url}><Layout/></StaticRouter>);
```
Please note how we pass location from the request object.

Try to test navigation with JS enabled and disabled.

### 404 Not Found

What happens when you go to a URL that doesn't exist?

It looks like we're currently returning 200, but we should be returning 404.

First let's add 404 page:
shared/pages/NotFound.js
```javascript
import React from 'react';

export default ({staticContext = {}}) => {
    staticContext.status = 404;
    return <h2>Not found</h2>;
};
```
We're using staticContext passed by the React Router where we can add custom
data. This property is a contract between your component and the router.

Now let's modify our layout to incorporate 404 page:

shared/Layout.js
```javascript
import React from "react";
import {Link, Switch, Route} from "react-router-dom";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

export default () => (
    <div>
        <h1>Messenger</h1>
        <div>
            <Link to="/">Home</Link>
            <Link to="/messages">Messages</Link>
            <Link to="/notFound">404</Link>
        </div>
        <Switch>
            <Route path="/" exact component={Home}/>
            <Route path="/messages" component={Messages}/>
            <Route component={NotFound} />
        </Switch>
    </div>
)
```
We added a link to trigger 404 client side and also there's a new Route
that matches anything not matched by the previous routes.

And finally our server code translating React Router Not Found to HTTP status code.


server/server.js
```javascript
app.get('*', (req, res) => {
    const context = {};
    const content = renderToString(<StaticRouter location={req.url} context={context}><Layout/></StaticRouter>);

    if(context.status) {
        res.status(context.status);
    }

    res.send(template(content));
});
```
We're passing context object to the StaticRouter. This object is modified
by the NotFound page (staticContext). We check if any page set the status (it's my convention)
and if there is one we set HTTP response status.

If you trigger 404 from a browser you should get a proper HTTP code now.

### Redirect

Another thing we should translate from React Router to HTTP status codes is Redirect.

Let's add a new page

shares/pages/NotReadyYet.js
```javascript
import React from 'react';
import {Redirect} from 'react-router-dom';

export default () => <Redirect to='/'/>;
```

Modify Layout.js
```javascript
import React from "react";
import {Link, Switch, Route} from "react-router-dom";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import NotReadyYet from './pages/NotReadyYet';

export default () => (
    <div>
        <h1>Messenger</h1>
        <div>
            <Link to="/">Home</Link>
            <Link to="/messages">Messages</Link>
            <Link to="/soon">Coming Soon</Link>
            <Link to="/notFound">404</Link>
        </div>
        <Switch>
            <Route path="/" exact component={Home}/>
            <Route path="/messages" component={Messages}/>
            <Route path="/soon" component={NotReadyYet}/>
            <Route component={NotFound} />
        </Switch>
    </div>
)
```

While it works client side, if you go to localhost:3000/soon with your JS disabled
no redirect is performed. Let's fix it.

It turns out that React Router populates context object with a url property
when redirect happens.

server/server.js
```
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
```
Please note that we're making early return when redirect happens so that
res.send does not trigger.

If you test it with JS disabled you should get 302 and browser should redirect
to the Home resource.

## Interlude - basic styling

server/server.js
```html
<head>
    <title>Universal React</title>
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
      />
</head>
```

shared/Layout.js
```html
<div className="ui fixed inverted menu">
    <Link to="/" className="header item">Home</Link>
    <Link to="/messages" className="item">Messages</Link>
    <Link to="/soon" className="item">Coming Soon</Link>
    <Link to="/notFound" className="item">404</Link>
</div>
```

## Universal state

Next we need to see how to share state management between server and client.
We'll use Redux to build a boilerplate for more advanced scenarios.

Let's start with the action type/reducer/action creator for the application
day/night mode.

shared/reducers/modeReducer.js
```javascript
// ducks pattern: https://github.com/erikras/ducks-modular-redux
// keep action type, reducer and action creator together
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
```
We're using ducks pattern to keep all things redux together.

Since we're planning to add more state fragments let's add reducers combinator.

shared/reducers/index.js
```javascript
import {combineReducers} from 'redux';
import modeReducer from './modeReducer';

export default combineReducers({
    mode: modeReducer
});
```
For now we only have mode part of the state but we'll add more soon.

Now we can connect client side React with Redux:
client/client.js
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import reducer from '../shared/reducers';

import Layout from '../shared/Layout';

const store = createStore(reducer);

ReactDOM.hydrate(
    <Provider store={store}>
        <BrowserRouter>
            <Layout/>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root'));
```
Please note how we create client side store and inject it into the provider
that will connect view and state libraries together.

Now let's do the same thing server side.

server/server.js
```javascript
import {Provider} from "react-redux";
import {createStore} from 'redux';
import reducer from '../shared/reducers';

app.get('*', (req, res) => {
    const context = {};
    const store = createStore(reducer);

    const content = renderToString(
        <Provider store={store}>
            <StaticRouter location={req.url} context={context}>
                <Layout/>
            </StaticRouter>
        </Provider>
    );

    // ...
});
```

We can run our app to see if nothing got broken.

### Reading state

Let's try to read the state of the application mode in our Layout.

shared/Layout.js
```javascript
import {connect} from "react-redux";

const Layout = props => (
    <div className={props.mode}>
        // ...
    </div>
);

const mapStateToProps = state => ({
    mode: state.mode,
});

export default connect(mapStateToProps)(Layout);
```
We're mapping Redux state to props.

Test in your browser if the 'day' class has been set.

### Dispatching state on the server

Let's try to set the mode to 'night'.

server/server.js
```javascript
import {setMode} from '../shared/reducers/modeReducer';

store.dispatch(setMode('night'));
```

Disable JS in the browser and reload the page.
What class is being set on the Layout div?

### Passing server state to the client

Once you enable JS in the browser React will complain about discrepancy
between server rendered HTML and client side JS.

The reason for that is that when we create store on the client side we
essentially reset the state.

We need to find a way to pass initial state to the client side code.

Modify server side template and add state parameter

server/server.js
```javascript
const template = (content, state) => `
       <html>
            ...
            <body>
                <div id="root">${content}</div>
                <script>
                    window.INITIAL_STATE = ${JSON.stringify(state)}
                </script>
                <script src="client.js"></script>
            </body>
        </html>
`;

res.send(template(content, store.getState()));
```
Please note how we shoved the server calculated state into a global variable
that will be transported inside INITIAL_STATE.
Also please note how we're using string interpolation here.

Let's read the INITIAL_STATE on the client side now.

client/client.js
```javascript
const store = createStore(reducer, window.INITIAL_STATE);
```

Now with the JS enabled on the client side React should no longer complain
about state discrepancies and the 'night' mode should be set.

### Safer state passing

There's a safer alternative to JSON.stringify

server/server.js
```javascript
import serialize from 'serialize-javascript';

window.INITIAL_STATE = ${serialize(state)}
```

It will protect you against XSS attacks in this part of the app.

### Testing night mode

We can add some CSS:

server/server.js
```
<style>
   .night {
       background-color: lightgray;
   }
</style>
```

And a Mode component to switch modes on the client side:

shared/components/Mode.js
```javascript
import React from 'react';
import {connect} from "react-redux";
import {setMode} from "../reducers/modeReducer";

const Mode = props => (
    <div>
        {
            props.mode === 'night' ?
                <button className="ui inverted yellow button" onClick={() => props.setMode('day')}>Day Mode</button> :
                <button className="ui black basic button" onClick={() => props.setMode('night')}>Night Mode</button>
        }
    </div>
);

const mapStateToProps = state => ({
    mode: state.mode,
});

const mapDispatchToProps = dispatch => ({
    setMode: mode => dispatch(setMode(mode))
});

export default connect(mapStateToProps, mapDispatchToProps)(Mode);
```

And include it in your layout

shared/Layout.js
```javascript
import Mode from "./components/Mode";

<div className="ui container">
    <Mode/>
    <Switch>...</Switch>
</div>
```

## Universal data fetching

This time we'll try to fetch some data on the server side and then
render our HTML. The major difference between client and server side
data fetching is that server needs data before anything gets rendered.
On the client side we usually fetch data in the background
and render as it arrives.

### Shared API

First let's build API client to fetch data

shared/api/index.js
```javascript
import fetch from 'isomorphic-fetch';

function fetchMessages() {
    return fetch('https://jsonplaceholder.typicode.com/posts')
        .then(res => res.json());
}

export default {
    fetchMessages
}
```
We're using jsonplaceholder API to keep things simple.
Also we have to use isomorphic-fetch since fetch API is not
available in the server environment.

### Async Reducer

Now it's time to create a new reducer for the message fetching:

shared/reducers/messagesReducer.js
```javascript
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
```
Here we use a thunk to handle async actions.

We can add reducer to combined reducer for the entire app:

shared/reducers/index.js
```javascript
import {combineReducers} from 'redux';
import modeReducer from './modeReducer';
import messagesReducer from './messagesReducer';

export default combineReducers({
    mode: modeReducer,
    messages: messagesReducer
});
```

### Enable thunk middleware

We need to enable redux-thunk on the client side first:

client/client.js
```javascript
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

const store = createStore(reducer, window.INITIAL_STATE, applyMiddleware(thunk));
```

Same thing on the server side:

server/server.js
```javascript
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

const store = createStore(reducer, {}, applyMiddleware(thunk));
```
Here we had to specify initial state set to the empty object.

### Traditional client side data fetching

First let's try to fetch data in a traditional way from componentDidMount

shared/pages/Messages.js
```javascript
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fetchMessages} from "../reducers/messagesReducer";

class Messages extends Component {
    componentDidMount() {
        this.props.fetchMessages();
    }

    renderMessages() {
        return this.props.messages.map(message => {
            return <li className="item content" key={message.id}>{message.title}</li>
        });
    }

    render() {
        return (
            <div>
                <ul className="ui relaxed divided list">
                    {this.renderMessages()}
                </ul>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {messages: state.messages}
}

const mapDispatchToProps = dispatch => ({
    fetchMessages: () => dispatch(fetchMessages())
});

export default connect(mapStateToProps, mapDispatchToProps)(Messages);
```
This will only work client side. When you disable JS no messages will be rendered.
componentDidMount is never invoked on the server side.

### Static routes

To fetch data on the server side we need to know upfront which route matched our request.
We need to move our routes to a separate file.

shared/routes/index.js
```javascript
import Home from "../pages/Home";
import Messages from "../pages/Messages";
import NotFound from "../pages/NotFound";
import NotReadyYet from '../pages/NotReadyYet';

const routes = [
    {
        path: '/',
        exact: true,
        component: Home
    },
    {
        path: '/messages',
        component: Messages
    },
    {
        path: '/soon',
        component: NotReadyYet
    },
    {
        path: '*',
        component: NotFound
    }
];

export default routes;
```
I added path to the NotFound component as one of the following exercices
will break without it (matchPath).

We can switch our Layout to use the new routes:

shared/Layout.js
```javascript
import routes from './routes';

<Switch>
     {routes.map((route, i) => (<Route key={i} {...route}/>))}
 </Switch>
```
We need to add the key so that React doesn't complain.

Test if everything works so far.

### Match path on the server

Now we need to find a matching path on the server to fetch appropriate data.

server/server.js
```javascript
import {StaticRouter, matchPath} from "react-router-dom";
import routes from '../shared/routes';

app.get('*', async (req, res) => {
    await Promise.all(routes
        .filter(route => matchPath(req.url, route) && route.component.loadData)
        .map(route => store.dispatch(route.component.loadData(matchPath(req.url, route)))));


    const content = renderToString(...);
});
```
What's going on in this code:
* we made the handler function async so that we can await on async values
* we use React Router's matchPath to select only one route
* matchPath returns result with a shape of {path, url, isExact, params}
* if there's no matching route subsequent map is  irrelevant
* if component has loadData function (our convention), dispatch load data to the store
* we also add the resulting match to loadData just in case params are needed
* since we're operating on arrays we need to use Promise.all to wait for the
promises in the array to resolve (event if there's only one promise in the array).

Let's add loadData to Messages.js

shared/pages/Messages.js
```javascript
class Messages extends Component {
    static loadData() {
        return fetchMessages();
    }
}
```

If you disable JS in the browser all messages should still get returned.

## Bigger exercise

Your task will be to implement Message page with one message fetch from the API.

Hints:
* add fetchMessage() to shared/api/index.js (https://jsonplaceholder.typicode.com/posts/:id)
* link from messages list in the Messages page to the Message page
* update routes/index.js with our new route (path: '/message/:id')
* create new messageReducer.js and add it to composite reducer
* display message title and description in your Message page
* remember to test with JS enabled and disabled

Good luck!

## More resources

Here's my favourite online resources about SSR in React:
* Router docs: https://reacttraining.com/react-router/web/guides/server-rendering
* Blog: https://alligator.io/react/react-router-ssr/
* Blog: https://medium.freecodecamp.org/demystifying-reacts-server-side-render-de335d408fe4
* Course: https://www.udemy.com/server-side-rendering-with-react-and-redux/

