import { createRoot } from "react-dom/client";
import { App } from "./app";
import { Provider } from "react-redux";
import { store } from "./store";

const container = document.getElementById("app");
if (!container) throw new Error("Failed to find the root element");
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
