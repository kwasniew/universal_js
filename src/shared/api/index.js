import fetch from 'isomorphic-fetch';

function fetchMessages() {
    return fetch('https://jsonplaceholder.typicode.com/posts')
        .then(res => res.json());
}

function fetchMessage(id) {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
        .then(res => res.json());
}

export default {
    fetchMessages,
    fetchMessage
}