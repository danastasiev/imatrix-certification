import React from 'react';

import {makeStyles} from "@material-ui/core/styles";
import mainBackground from "../../assets/img/main-background.svg";
import Box from "@material-ui/core/Box";


const useStyles = makeStyles((theme) => ({
  container: {
    backgroundImage: `url(${mainBackground})`
  },
}));

export const BackgroundBox = ({children, ...rest}) => {
  const classes = useStyles();
  return (
    <Box
      className={classes.container}
      height="calc(100% - 75px)"
      {...rest}
    >
      { children }
    </Box>
  )
};