import React from "react";
import ReactDOM from "react-dom/client";
import { TestPage } from "./TestPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <TestPage
    baseUrl="https://api.inferable.ai"
    clusterId="01J7M4V93BBZP3YJYSKPDEGZ2T"
    apiSecret="test"
  />
);
