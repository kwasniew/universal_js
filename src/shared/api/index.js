import fetch from 'isomorphic-fetch';

function fetchMessages() {
    return fetch('https://jsonplaceholder.typicode.com/posts')
        .then(res => res.json());
}

export default {
    fetchMessages
}