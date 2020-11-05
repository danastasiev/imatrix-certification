import React, {useEffect, useState} from "react";
import {getBatches} from "../../redux/api";
import {Box, Button, CircularProgress, Paper} from "@material-ui/core";
import {compose} from "redux";
import {connect} from "react-redux";
import {BackgroundBox} from "../elements";
import {BatchCard} from "./batch-card";
import {BLE, WIFI} from "./constants";
import {CreateBatchModal} from "./create-batch-modal";
import { withRouter } from 'react-router-dom';
import {makeStyles} from "@material-ui/core/styles";
import {push} from "react-router-redux";

const useStyles = makeStyles({
  paper: {
    overflowY: 'auto'
  }
});

const Batches = ({match, push}) => {
  const { params: { productId } } = match;
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [open, setOpen] = useState(false);
  const [batchType, setType] = useState(WIFI);

  useEffect(() => {
    (async() => {
      try{
        const batchesResponse = await getBatches(productId);
        setBatches(batchesResponse)
      } catch (e) {
        console.log(e);
        push('/products')
      } finally {
        setLoading(false)
      }
    })()
  }, []);

  const openModal = (type) => {
    setType(type);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const addBatch = (batch) => setBatches([...batches, batch]);

  return (
    <BackgroundBox display="flex">
      <Box
        component={Paper}
        className={classes.paper}
        minHeight="200px"
        maxHeight="70%"
        overflowY="auto"
        width="100%"
        height="fit-content"
        p={5}
        m={5}
        display="flex"
        flexDirection="column"
      >
        <Box
          mb={5}
          display="flex"
          alignItems="center"
        >
          <Button size="small" color="secondary" variant="contained" onClick={() => openModal(WIFI)}>
            + New WIFI batch
          </Button>
          <Box ml={2}>
            <Button size="small" color="secondary" variant="contained" onClick={() => openModal(BLE)}>
              + New BLE batch
            </Button>
          </Box>
        </Box>
        <Box
          display="flex"
          flexWrap="wrap"
        >
          {loading ? (<CircularProgress color="primary"/>) :
            batches.map(b => <BatchCard key={b.id} batch={b}/>)
          }
        </Box>
      </Box>
      <CreateBatchModal
        addBatch={addBatch}
        open={open}
        closeModal={closeModal}
        batchType={batchType}
        productId={productId}
      />
    </BackgroundBox>
  )
};

export default compose(
  connect(null, {push}),
  withRouter
)(Batches);
