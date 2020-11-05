import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { Mac } from './mac';

export const MacList = ({ amountDefined, amount, setValidMacs, loading }) => {
  const [macs, setMacs] = useState({ [0]: { value: '', valid: false }});
  const macIds = Object.keys(macs);
  const addMac = () => setMacs({
    [macIds.length]: { value: '', valid: false },
    ...macs,
  });
  const removeMac = (id) => setMacs(macIds.reduce((res, macId) => {
    if (macId !== id) {
      res[macId] = macs[macId];
    }

    return res;
  }, {}));

  const changeMac = (id, mac) => setMacs(macIds.reduce((res, macId) => {
    if (macId === id) {
      res[macId] = mac;
    } else {
      res[macId] = macs[macId];
    }
    return res;
  }, {}));

  useEffect(() => {
    const validMacs = Object.values(macs).filter((mac) => mac.valid).map((mac) => mac.value);
    setValidMacs([...new Set(validMacs)]);
  }, [macs]);

  return (
    <Box>
      <Box maxHeight = '100px' overflow = 'scroll'>
        { macIds.map((id) =>
          <Mac
            id = { id }
            key = { id }
            mac = { macs[id] }
            removeMac = { removeMac }
            changeMac = { changeMac }
            amountDefined = { amountDefined }
            loading = { loading }
            />
        )}
        </Box>
          <Box mt = { 1 }>
          <Button
            color = 'primary'
            disabled = { loading || !amountDefined || Number(amount) === macIds.length }
            variant = 'outlined'
            onClick = { addMac }>
                ADD
        </Button>
      </Box>
      </Box>
  );
};
