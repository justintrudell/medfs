import { createElement } from 'react';
import { render } from 'react-dom';
import Router from './router';

let root = document.getElementById('app');
render(createElement(Router), root);
