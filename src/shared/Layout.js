import React from "react";
import {Link, Switch, Route} from "react-router-dom";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import NotReadyYet from './pages/NotReadyYet';
import Mode from "./components/Mode";
import {connect} from "react-redux";

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
                <Route path="/" exact component={Home}/>
                <Route path="/messages" component={Messages}/>
                <Route path="/soon" component={NotReadyYet}/>
                <Route component={NotFound}/>
            </Switch>
        </div>
    </div>
);

const mapStateToProps = (state) => ({
    mode: state.mode,
});

export default connect(mapStateToProps)(Layout);