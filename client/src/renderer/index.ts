import { createElement } from "react";
import { render } from "react-dom";
import { Router } from "./router";

const root = document.getElementById("app");
render(createElement(Router), root);
