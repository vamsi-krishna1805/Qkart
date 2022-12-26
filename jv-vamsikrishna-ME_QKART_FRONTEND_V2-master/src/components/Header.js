import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PatternIcon from '@mui/icons-material/Pattern';
import Box from "@mui/material/Box";
import React from "react";
import {useHistory} from "react-router-dom"
import {Link} from "react-router-dom"
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const logOut = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("balance");
    history.push("/");
    window.location.reload()
  }

  const getUserName = (string) => {
    let name = string;
    let uppercaseWord = name.charAt(0).toUpperCase() + name.slice(1);
    return uppercaseWord;
  }
  // console.log(localStorage.getItem("token"))
    if(hasHiddenAuthButtons){
      return (
        <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Button
            className="explore-button"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => {history.push("/")}}
          >
            Back to explore
          </Button>
        </Box>
      )
    }

    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Box className="desktop-search">{children}</Box>
        <Stack>
        { (localStorage.getItem("token") ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar alt={localStorage.getItem("username")} src="https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png" />
            <h3 style={{fontWeight: 600, fontSize: 16}}>{getUserName(localStorage.getItem("username"))}</h3>
            <Button color="error" endIcon={<ExitToAppIcon/>} onClick={()=>{logOut()}}>
            LOGOUT
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center">
            <Link to="/register" className="link"><Button className="btnLink" variant="outlined" startIcon={<HowToRegIcon/>}>REGISTER</Button></Link>
            <Link to="/login" className="link"><Button className="btnLink" variant="contained" startIcon={<PatternIcon/>} style={{backgroundColor:"#00a278 !important"}}>LOGIN</Button></Link>
          </Stack>
        )) }
        </Stack>
      </Box>
    );
};

export default Header;
