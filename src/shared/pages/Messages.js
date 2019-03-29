import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fetchMessages} from "../reducers/messagesReducer";
import {Link} from "react-router-dom";

class Messages extends Component {
    static loadData() {
        return fetchMessages();
    }

    componentDidMount() {
        this.props.fetchMessages();
    }

    renderMessages() {
        return this.props.messages.map(message => {
            return <li className="item content" key={message.id}><Link to={`/message/${message.id}`}>{message.title}</Link></li>
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