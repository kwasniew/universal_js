import React from "react";
import {Link, Switch, Route} from "react-router-dom";
import Mode from "./components/Mode";
import {connect} from "react-redux";
import routes from './routes';

const Layout = props => (
    <div className={props.mode}>
        <h1>Messenger</h1>
        <div className="ui fixed inverted menu">
            <Link to="/" className="header item">Home</Link>
            <Link to="/messages" className="item">Messages</Link>
            <Link to="/soon" className="item">Coming Soon</Link>
            <Link to="/notFound" className="item">404</Link>
        </div>
        <div className="ui container">
            <Mode/>
            <Switch>
                {routes.map((route, i) => (<Route key={i} {...route}/>))}
            </Switch>
        </div>
    </div>
);

const mapStateToProps = (state) => ({
    mode: state.mode,
});

export default connect(mapStateToProps)(Layout);