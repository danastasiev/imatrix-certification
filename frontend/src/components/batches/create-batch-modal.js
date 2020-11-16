import React, { useState } from 'react';
import { checkMac, createBatch as createApi, createBatchFromFile } from '../../redux/api';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { BLE, WIFI } from './constants';
import CircularProgress from '@material-ui/core/CircularProgress';
import { BleMacSection } from './ble-mac-section';
import { MANUAL, SEQUENCE, validateMacStructure } from './utils';
import { UploadFileSection } from './upload-file-section';
import Typography from '@material-ui/core/Typography';


export const CreateBatchModal = ({ open, closeModal, batchType, addBatch, productId }) => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [mac, setMac] = useState('');
  const [incorrectMac, setIncorrectMac] = useState('');
  const [creationError, setCreationError] = useState('');
  const [bleMacMode, setBleMacMode] = useState(SEQUENCE);
  const [validMacs, setValidMacs] = useState([]);
  const [file, setFile] = useState(null);

  const isBLE = batchType === BLE;

  const closeModalHandler = () => {
    closeModal();
    setAmount('');
    setCreationError('');
  };
  const fileWasSet = file !== null;

  const createBatch = async () => {
    try {
      setLoading(true);
      setCreationError('');
      if (!fileWasSet && isBLE && bleMacMode === SEQUENCE) {
        const macCorrect = await checkMac(mac, amount);
        if (!macCorrect) {
          setIncorrectMac(mac);
          setLoading(false);

          return;
        }
      }
      let batch;
      if (fileWasSet) {
        batch = await createBatchFromFile(file, productId, description);
      } else {
        batch = await createApi(
          productId,
          amount,
          batchType,
          isBLE ? bleMacMode === MANUAL ? { description, macs: validMacs } : { description, firstMac: mac }
            : { description }
        );
      }
      addBatch({ ...batch });
      closeModalHandler();
    } catch (e) {
      if (e.isAxiosError) {
        setCreationError(e.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const validateMac = () => incorrectMac !== mac && validateMacStructure(mac);

  const showValidationError = isBLE && mac && !validateMac(mac);

  const isDisabled = () => {
    const amountSetIncorrectly = amount > 5000 || amount <= 0;
    if (batchType === WIFI) {
      return !amount || amountSetIncorrectly;
    }
    if (fileWasSet) {
      return false;
    }

    if (bleMacMode === MANUAL) {
      return !amount || validMacs.length !== Number(amount);
    }

    return !amount || !mac || amountSetIncorrectly || showValidationError;
  };

  return (
    <Dialog open = { open } onClose = { closeModalHandler }>
      <DialogTitle>Create batch</DialogTitle>
      <DialogContent>
        <Box height = { isBLE ? 400 : 270 } width = { 550 }>
          { creationError && (
            <Box>
              <Typography color = 'error'>{ creationError } </Typography>
            </Box>
          ) }
          { isBLE && (
            <Box>
              <UploadFileSection loading = { loading } setFile = { setFile } />
              <Box mt = { 2 }><Typography>OR</Typography></Box>
          </Box>
          )}
          <TextField
            disabled = { loading || fileWasSet }
            autoFocus
            margin = 'dense'
            label = 'Number of devices'
            type = 'number'
            fullWidth
            min = { 1 }
            max = { 5000 }
            onChange = { (e) => setAmount(e.target.value) }
            />
          {
            isBLE && (
              <BleMacSection
                loading = { loading || fileWasSet }
                showValidationError = { showValidationError }
                setMac = { setMac }
                amount = { amount }
                bleMacMode = { bleMacMode }
                setBleMacMode = { setBleMacMode }
                setValidMacs = { setValidMacs }
            />
            )
          }
          <Box mt = { 2 }>
            <TextField
              disabled = { loading }
              label = 'Description'
              multiline
              rows = { 4 }
              variant = 'outlined'
              helperText = 'Optional'
              fullWidth
              onChange = { (e) => setDescription(e.target.value) }
              />
            </Box>
          </Box>
        </DialogContent>
      <DialogActions>
        <Button color = 'primary' onClick = { closeModalHandler }>
          Cancel
          </Button>
        <Button color = 'primary' disabled = { isDisabled() || loading } onClick = { createBatch }>
          { loading ? <CircularProgress size = { 16 } /> : 'Create' }
          </Button>
        </DialogActions>
      </Dialog>
  );
};
