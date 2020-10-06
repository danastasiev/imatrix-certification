import React, {useEffect, useState} from "react";
import {getBatchDevices, downloadBatch, getBatchInfo} from "../../redux/api";
import {Box, Button, CircularProgress, Paper} from "@material-ui/core";
import {compose} from "redux";
import {connect} from "react-redux";
import {BackgroundBox} from "../elements";
import {withRouter} from "react-router-dom";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import {Check, ChevronLeft, Close} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import TablePagination from "@material-ui/core/TablePagination";
import Typography from "@material-ui/core/Typography";
import {format} from "date-fns";
import {push} from "react-router-redux";
import IconButton from "@material-ui/core/IconButton";


const useStyles = makeStyles({
  paper: {
    overflowY: 'auto'
  },
  text: {
    fontWeight: 100
  }
});

const ROWS_PER_PAGE = 6;

const Batch = ({auth, match, push}) => {
  const { params: { batchId } } = match;
  const classes = useStyles();
  const {token} = auth;
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [batchInfo, setBatchInfo] = useState({});
  const [batchInfoLoading, setBatchInfoLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [devicesNumber, setTotal] = useState(0);

  useEffect(() => {
    (async() => {
      try{
        setLoading(true);
        const { total, devices: devicesResponse  } = await getBatchDevices(
          token,
          batchId,
          {
            from: page * ROWS_PER_PAGE,
            to: ROWS_PER_PAGE
          }
        );
        setDevices(devicesResponse);
        setTotal(total);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false)
      }
    })()
  }, [page]);

  useEffect(() => {
    (async() => {
      try{
        const batch = await getBatchInfo(token, batchId);
        setBatchInfo(batch);
      } catch (e) {
        console.log(e);
        push('/products');
      } finally {
        setBatchInfoLoading(false)
      }
    })()
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleDownload = async() => {
    try {
      setDownloadLoading(true);
      await downloadBatch(token, batchId)
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <BackgroundBox display="flex" flexDirection="column">
      <Box
        component={Paper}
        height="fit-content"
        p={5}
        m={5}
        paddingTop="10px"
        paddingLeft="10px"
        display="flex"
        justifyContent="center"
        flexDirection="column"
      >
        <Box>
          <IconButton disable={batchInfoLoading} onClick={() => push(`/product/${batchInfo.productId}`)}>
            <ChevronLeft fontSize="large" color="primary"/>
          </IconButton>
        </Box>
        {
          batchInfoLoading ? <CircularProgress /> :
            <Box display="flex" alignItems="center" width="100%" justifyContent="space-around">
              <Box>
                <Typography variant="subtitle1">
                  Registered
                </Typography>
                <Typography variant="subtitle1" className={classes.text}>
                  { batchInfo.registered }
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1">
                  Activated
                </Typography>
                <Typography variant="subtitle1" className={classes.text}>
                  { batchInfo.activated }
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1">
                  Type
                </Typography>
                <Typography variant="subtitle1" className={classes.text}>
                  { batchInfo.type }
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1">
                  Created
                </Typography>
                <Typography variant="subtitle1" className={classes.text}>
                  { format(new Date(batchInfo.created).getTime(), 'dd/MM/yyyy hh:mm:ss') }
                </Typography>
              </Box>

            </Box>
        }
      </Box>
      <Box
        component={Paper}
        className={classes.paper}
        minHeight="200px"
        overflowY="auto"
        height="fit-content"
        p={5}
        m={5}
        mt={0}
        display="flex"
        flexDirection="column"
      >
      <Box
        mb={3}
        display="flex"
        alignItems="center"
      >
        <Button
          size="small"
          color="secondary"
          variant="contained"
          onClick={handleDownload}
          disabled={downloadLoading}
        >
          Download
        </Button>
      </Box>
      <Box
        display="flex"
        flexWrap="wrap"
      >
        <Box width="100%">
          <Table size="small">
           <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle1" className={classes.text}>
                  Serial number
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" className={classes.text}>
                  MAC
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" className={classes.text}>
                  Activated
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { loading ?
              (
                <TableRow><TableCell><CircularProgress/></TableCell></TableRow>
              ) :
              devices.map((device) => (
              <TableRow key={device.sn}>
                <TableCell>
                  {device.sn}
                </TableCell>
                <TableCell>{device.mac}</TableCell>
                <TableCell>{device.cpuId ? <Check /> : <Close />}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[ROWS_PER_PAGE]}
                count={devicesNumber}
                rowsPerPage={ROWS_PER_PAGE}
                page={page}
                onChangePage={handleChangePage}
              />
            </TableRow>
          </TableBody>
        </Table>
        </Box>
      </Box>
    </Box>
    </BackgroundBox>
  )
};

const mapStateToProps = ({ auth}) => ({
  auth,
});

export default compose(
  connect(mapStateToProps, {push}),
  withRouter
)(Batch);
