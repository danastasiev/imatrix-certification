import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import { Check, ErrorOutline, Delete } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import { validateMacStructure } from './utils';
import CircularProgress from '@material-ui/core/CircularProgress';
import { checkMac } from '../../redux/api';

export const Mac = ({ id, removeMac, changeMac, amountDefined, mac, loading }) => {
  const [checkLoading, setLoading] = useState(false);


  const checkMacValidity = async (macValue) => {
    if (!validateMacStructure(macValue)) {
      changeMac(id, { valid: false, value: macValue });
      return;
    }
    try {
      setLoading(true);
      const macCorrect = await checkMac(macValue);
      changeMac(id, { valid: macCorrect, value: macValue });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box alignItems = 'center' display = 'flex' justifyContent = 'space-between' width = '100%'>
      <TextField
        autoFocus
        fullWidth
        disabled = { loading || !amountDefined }
        placeholder = 'Example: 00:11:22:33:44:66'
        onChange = { (e) => checkMacValidity(e.target.value) }
        />
      {
        id !== '0' && (
          <IconButton
            onClick = { () => removeMac(id) }
            disabled = { loading }>
            <Delete />
        </IconButton>
        )
      }
      {checkLoading ? <CircularProgress size = { 16 } /> : mac.valid ? <Check /> : <ErrorOutline /> }
      </Box>
  );
};
