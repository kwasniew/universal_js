import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fetchMessage} from "../reducers/messageReducer";

class Message extends Component {
    static loadData(match) {
        return fetchMessage(match.params.id);
    }

    componentDidMount() {
        this.props.fetchMessage(this.props.match.params.id);
    }

    render() {
        return (
            <dl className="ui container">
                <dt>Title</dt>
                <dd>{this.props.message.title}</dd>
                <dt>Description</dt>
                <dd>{this.props.message.body}</dd>
            </dl>
        );
    }
}

function mapStateToProps(state) {
    return {message: state.message}
}

const mapDispatchToProps = dispatch => ({
    fetchMessage: (id) => dispatch(fetchMessage(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Message);