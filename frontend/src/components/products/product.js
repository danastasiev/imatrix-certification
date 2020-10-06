import React from 'react';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles({
  root: {
    width: 180,
    backgroundColor: '#e7e7e7',
    padding: 4,
    margin: 10,
    height: 'fit-content'
  },
  text: {
    fontWeight: 100
  }
});


export const Product = ({ product }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.text} variant="h5">
          { product.name }
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" href={`/product/${product.id}`}>
          Show batches
        </Button>
      </CardActions>
    </Card>
  );
};