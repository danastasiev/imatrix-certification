import React from 'react';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { MacList } from './mac-list';
import { MANUAL, SEQUENCE } from './utils';

export const BleMacSection = ({
  loading,
  showValidationError,
  setMac,
  amount,
  setBleMacMode,
  bleMacMode,
  setValidMacs,
}) => {
  const handleChange = (event) => {
    setBleMacMode(event.target.value);
  };

  const amountDefined = amount !== '';

  return (
      <Box mt = { 2 }>
        <Box
          display = 'flex'
          justifyContent = 'center'
          width = '100%'>
          <FormControlLabel
            control = {
              <Radio
                checked = { bleMacMode === SEQUENCE }
                color = 'primary'
                value = { SEQUENCE }
                onChange = { handleChange }
                disabled = { loading }
            />
          }
            label = 'Set sequence'
            labelPlacement = 'top'
        />
          <FormControlLabel
            control = {
              <Radio
                checked = { bleMacMode === MANUAL }
                color = 'primary'
                value = { MANUAL }
                onChange = { handleChange }
                disabled = { loading }
            />
          }
            label = 'Set manually'
            labelPlacement = 'top'
        />
      </Box>
        {
        bleMacMode === SEQUENCE ? (
            <TextField
              fullWidth
              disabled = { loading || !amountDefined }
              error = { showValidationError }
              helperText = { showValidationError && 'MAC invalid' }
              label = 'First MAC address'
              placeholder = 'Example: 00:11:22:33:44:66'
              onChange = { (e) => setMac(e.target.value) }
          />
        ): (
            <MacList
              amount = { amount }
              amountDefined = { amountDefined }
              setValidMacs = { setValidMacs }
              loading = { loading }
          />
        )
      }

    </Box>
  );
};
