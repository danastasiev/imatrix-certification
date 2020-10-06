import React, {Fragment} from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { connect } from 'react-redux';

import { compose } from 'redux';

import LoginPage from "./components/login";
import {ConnectedRouter as Router} from "react-router-redux";
import {history} from "./redux/store";
import Header from "./components/header";
import Products from "./components/products";
import Batches from "./components/batches";
import Batch from "./components/batch";

const App = ({auth}) => {
  const { token } = auth;

  return(
    <Fragment>
      <Header />
      <Router history = { history }>
        {
          token ? (
            <Switch>
              <Route exact component = { Products } path = '/products' />
              <Route exact component = { Batches } path = '/product/:productId' />
              <Route exact component = { Batch } path = '/batch/:batchId' />
              <Route exact component = { Products } path = '/products' />
              <Redirect exact push to = '/products' />
            </Switch>
          ) : (

            <Switch>
              <Route exact component = { LoginPage } path = '/auth' />
              <Redirect exact push to = '/auth' />
            </Switch>
          )
        }
      </Router>
    </Fragment>
  )
};


const mapStateToProps = ({ auth}) => ({
  auth,
});

export default compose(
  connect(mapStateToProps)
)(App);
