import React from 'react';
import {Box} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import logo from '../../assets/img/logo.svg';
import Typography from "@material-ui/core/Typography";
import grey from '@material-ui/core/colors/grey';
import {compose} from "redux";
import {connect} from "react-redux";
import {logout} from "../../redux/actions";
import Button from "@material-ui/core/Button";
import {push} from "react-router-redux";

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: '#f8f8f8',
    borderColor: '#e7e7e7',
    height: 75,
    paddingRight: 40,
    paddingLeft: 40,
  },
  logo: {
    width: 144,
    height: 50,
    marginRight: 15
  },
  logoText: {
    color: grey[600]
  }
}));
const Header = ({auth, logout, push}) => {
  const classes = useStyles();
  const { token } = auth;
  return (
    <Box
      className={classes.header}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box
        display="flex"
        alignItems="center"
      >
        <img
          className={classes.logo}
          src={logo}
        />
        <Typography
          variant="h5"
          className={classes.logoText}
        >
          Certification Server
        </Typography>

      </Box>
      {
        token && (
          <Box display="flex" alignItems="center">
            <Box mr={2}>
              <Button size="small" color="primary" onClick={() => push('/products')}>
                Products
              </Button>
            </Box>
            <Button size="small" color="primary" onClick={() => logout()}>
              Logout
            </Button>
          </Box>
        )
      }
    </Box>
  );
};

const mapStateToProps = ({ auth}) => ({
  auth,
});

export default compose(
  connect(mapStateToProps, { logout, push })
)(Header);