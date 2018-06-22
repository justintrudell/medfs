import {createElement} from 'react';
import {render} from 'react-dom';
import Main from './main';

let root = document.getElementById('app');
render(createElement(Main), root);
