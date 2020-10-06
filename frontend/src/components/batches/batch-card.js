import React from 'react';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import { makeStyles } from '@material-ui/core/styles';
import {format} from "date-fns";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles({
  root: {
    width: 270,
    backgroundColor: '#e7e7e7',
    padding: 4,
    margin: 10,
    height: 'fit-content'
  },
  text: {
    fontWeight: 100
  }
});


export const BatchCard = ({ batch }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          width="100%"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1">
            Created
          </Typography>
          <Typography variant="subtitle1" className={classes.text}>
            { format(new Date(batch.created).getTime(), 'dd/MM/yyyy hh:mm:ss') }
          </Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          width="100%"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1">
            Registered
          </Typography>
          <Typography variant="subtitle1" className={classes.text}>
            { batch.registered }
          </Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          width="100%"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1">
            Activated
          </Typography>
          <Typography variant="subtitle1" className={classes.text}>
            { batch.activated }
          </Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          width="100%"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1">
            Type
          </Typography>
          <Typography variant="subtitle1" className={classes.text}>
            { batch.type }
          </Typography>
        </Box>
        {
          batch.description && (
            <Box mt={2}>
              <Typography variant="caption">
                {batch.description  }
              </Typography>
            </Box>
          )
        }


      </CardContent>
      <CardActions>
        <Button size="small" color="secondary" variant="contained" href={`/batch/${batch.id}`}>
          Open
        </Button>
      </CardActions>
    </Card>
  );
};