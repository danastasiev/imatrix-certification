import React, {useState} from 'react';
import {checkMac, createBatch as createApi} from "../../redux/api";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import {BLE, WIFI} from "./constants";
import CircularProgress from "@material-ui/core/CircularProgress";


export const CreateBatchModal = ({ open, closeModal, batchType, addBatch, productId, token }) => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [mac, setMac] = useState('');
  const [incorrectMac, setIncorrectMac] = useState('');
  const isBLE = batchType === BLE;

  const createBatch = async () => {
    try{
      setLoading(true);
      if (isBLE) {
        const macCorrect = await checkMac(token, mac, amount);
        if (!macCorrect) {
          setIncorrectMac(mac);
          setLoading(false);
          return;
        }
      }
      const batch = await createApi(
        token,
        productId,
        amount,
        batchType,
        isBLE ? { description, firstMac: mac }: { description }
      );
      addBatch({...batch, registered: amount, activated: 0});
      closeModal();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false)
    }
  };

  const validateMac = () => incorrectMac !== mac && /^([0-9a-fA-F]{2}[:]?){5}([0-9a-fA-F]{2})$/.test(mac);

  const showValidationError = isBLE && mac && !validateMac(mac);

  const isDisabled = () => {
    const amountSetIncorrectly = amount > 5000 || amount <= 0;
    if (batchType === WIFI) {
      return !amount || amountSetIncorrectly;
    }
    return !amount || !mac || amountSetIncorrectly ||  showValidationError;
  };

  return (
    <Dialog open={open} onClose={closeModal}>
      <DialogTitle>Create batch</DialogTitle>
      <DialogContent>
        <Box width={550} height={270}>
          <TextField
            disabled={loading}
            autoFocus
            margin="dense"
            label="Number of devices"
            type="number"
            fullWidth
            min={1}
            max={5000}
            onChange={(e) => setAmount(e.target.value)}
          />
          {
            isBLE && (
              <TextField
                disabled={loading}
                error={showValidationError}
                label="First MAC address"
                fullWidth
                min={1}
                max={5000}
                onChange={(e) => setMac(e.target.value)}
                placeholder="Example: 00:11:22:33:44:66"
                helperText={showValidationError && 'MAC invalid'}
              />
            )
          }
          <Box mt={2}>
            <TextField
              disabled={loading}
              label="Description"
              multiline
              rows={4}
              variant="outlined"
              helperText="Optional"
              fullWidth
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal} color="primary">
          Cancel
        </Button>
        <Button onClick={createBatch} color="primary" disabled={ isDisabled() || loading}>
          { loading ? <CircularProgress size={16}/> : 'Create' }
        </Button>
      </DialogActions>
    </Dialog>
  );
};