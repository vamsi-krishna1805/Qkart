import Register from "./components/Register";
import React from "react";
import ipConfig from "./ipConfig.json";
import { Route, Switch } from "react-router-dom";
import Login from "./components/Login";
import Products from "./components/Products";
import Checkout from "./components/Checkout";
import { OutlinedInput} from '@mui/material';
import Thanks from "./components/Thanks";


export const config = {
  endpoint: `http://${ipConfig.workspaceIp}:8082/api/v1`,
};

function App() {
  return (

    <div className="App">
      <Switch>
      {/* TODO: CRIO_TASK_MODULE_LOGIN - To add configure routes and their mapping */}
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/checkout">
          <Checkout />
        </Route>
        <Route path="/thanks">
          <Thanks />
        </Route>
        <Route exact path="/">
          <Products />
        </Route>
          {/* <Login /> */}
      
      </Switch>
    </div>
  );
}

export default App;
