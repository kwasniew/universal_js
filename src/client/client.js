import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from "react-router-dom";

import Layout from '../shared/Layout';

ReactDOM.hydrate(<BrowserRouter><Layout/></BrowserRouter>, document.getElementById('root'));