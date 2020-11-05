import React, { useEffect, useState } from 'react';
import { getProducts } from '../../redux/api';
import { Box, CircularProgress, Paper } from '@material-ui/core';
import { BackgroundBox } from '../elements';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Product } from './product';

const Products = () => {
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const prods = await getProducts();
        setProducts(prods);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  return (
    <BackgroundBox display = 'flex'>
      <Box
        component = { Paper }
        minHeight = '200px'
        width = '100%'
        height = 'fit-content'
        p = { 5 }
        m = { 5 }
        display = 'flex'
        flexWrap = 'wrap'>
        {loading ? (<CircularProgress color = 'primary' />) :
          products.map((p) => <Product key = { p.id } product = { p } />)
        }

        </Box>
      </BackgroundBox>
  );
};

export default Products;
