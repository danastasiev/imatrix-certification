import React, {useState} from 'react';
import { connect } from 'react-redux';
import {
  Box,
  Button,
  TextField
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

import {login} from "../../redux/api";
import {authSuccess} from "../../redux/actions";
import loginBackground from '../../assets/img/login-background.png';
import logo from "../../assets/img/logo.svg";

const useStyles = makeStyles((theme) => ({
  button: {
    width: '60%',
    minWidth: '50%'
  },
  container: {
    backgroundImage: `url(${loginBackground})`
  },
  form: {
    backgroundColor: '#f5f5f5'
  },
  logo: {
    width: 300,
    height: 70
  },
}));

const LoginPage = ({authSuccess}) => {
  const [emailValue, setEmail] = useState('');
  const [passwordValue, setPassword] = useState('');
  const classes = useStyles();
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const auth = async () => {
      if (emailValue === '') {
        setErrors({...errors, email: 'Required'});
        return;
      } else {
        setErrors((errors) => ({...errors, email: ''}) );
      }
      if (passwordValue === '') {
        setErrors((errors) => ({...errors, password: 'Required'}) );
        return;
      } else {
        setErrors((errors) => ({...errors, password: ''}) );
      }
      try {
        setLoginLoading(true);
        const responseData = await login(emailValue, passwordValue);
        authSuccess(responseData);
      } catch (e) {
        console.log(e);
        setErrors((errors) => ({...errors, password: 'Invalid credentials'}) );
      } finally {
        setLoginLoading(false);
      }
  };
  const {email, password} = errors;
  return(
    <Box
      width="100%"
      height="calc(100% - 75px)"
      display="flex"
      alignItems="center"
      justifyContent="flex-end"
      className={classes.container}
    >
      <Box
        className={classes.form}
        width="360px"
        height="90%"
        display="flex"
        alignItems="center"
        flexDirection="column"
        padding="20px 30px"
      >
        <Box paddingBottom="70px">
          <img
            className={classes.logo}
            src={logo}
          />
        </Box>
        <Box paddingBottom="20px" width="100%">
          <TextField
            fullWidth
            helperText={email}
            error={Boolean(email)}
            label="Username"
            onChange={(e) => setEmail(e.target.value)}
            disabled={loginLoading}
          />
        </Box>
        <Box paddingBottom="20px" width="100%">
          <TextField
            fullWidth
            type="password"
            helperText={password}
            error={Boolean(password)}
            label="Password"
            onChange={(e) => setPassword(e.target.value)}
            disabled={loginLoading}
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={auth}
          className={classes.button}
          disabled={loginLoading}
        >
          Login
        </Button>

      </Box>
    </Box>
  )
};

export default connect(null, { authSuccess })(LoginPage);