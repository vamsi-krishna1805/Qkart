import { Button,LinearProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const [formData, setFormData] = useState({username:"",password:""})
  const [loading, setLoading] = useState(false);
 

  const handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    setFormData((preState) => {
      return {...preState, [name] : value}
    })
  }
  // TODO: CRIO_TASK_MODULE_LOGIN - Fetch the API response
  /**
   * Perform the Login API call
   * @param {{ username: string, password: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   * Example for successful response from backend:
   * HTTP 201
   * {
   *      "success": true,
   *      "token": "testtoken",
   *      "username": "criodo",
   *      "balance": 5000
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Password is incorrect"
   * }
   *
   */
  const login = async (formData) => {
    setLoading(true);
    if (!validateInput(formData)) return;
    try{
      const response = await axios.post(config.endpoint+"/auth/login", formData)

      persistLogin(
      response.data.token,
      response.data.username,
      response.data.balance
      );

    setFormData({username:"",password:""});
    setLoading(false);

    enqueueSnackbar("Logged in Successfully",{variant:"success"});
    history.push("/");
  } catch(error) {
    setLoading(false)
    if(error.response && error.response.status === 400){
      enqueueSnackbar(error.response.data.message,{variant:"error"});
    } else {
      enqueueSnackbar(
        "Something went wrong. Check that the backend is running, reachable and returns valid JSON.", {variant:"error"}
      );
    }
  }
  };

  //-->>Curl Request :::::   curl -d '{ "username":"crio.do","password":"learnbydoing"}' \3.7.154.20:8082/api/v1/auth/login

  // TODO: CRIO_TASK_MODULE_LOGIN - Validate the input
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false and show warning message if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that password field is not an empty value - "Password is a required field"
   */
  const validateInput = (data) => {
    if(!data.username){
      enqueueSnackbar("Username is a required field", {variant:"warning"})
    }
    if(!data.password){
      enqueueSnackbar("Password is a required field",{variant:"warning"})
    }
    return true;
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Persist user's login information
  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} username
   *    Username of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   * Make use of localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * -    `token` field in localStorage can be used to store the Oauth token
   * -    `username` field in localStorage can be used to store the username that the user is logged in as
   * -    `balance` field in localStorage can be used to store the balance amount in the user's wallet
   */
  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token",token);
    localStorage.setItem("username",username);
    localStorage.setItem("balance",balance);
  }
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
        <h2 className="title">Login</h2>
        <TextField
            autoComplete="false"
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter Username"
            fullWidth
          />
        <TextField
            autoComplete="false"
            type="password"
            id="password"
            label="Password"
            variant="outlined"
            title="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            fullWidth
          />
        {
            loading ? 
            (<Box alignitem="center" style={{marginBottom: -10, marginTop: 30}}>
              {/* <CircularProgress size={25} color="primary"/> */}
              <LinearProgress color="success"/>
            </Box>) : <Button className="button" variant="contained" style={{justifyContent:"center"}}
           onClick={() => {login(formData)}}>LOGIN TO QKART</Button>
           }
        <p className="secondary-action">
        Don’t have an account?{" "}
             <Link className="link" to="/register">
             Register now
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
