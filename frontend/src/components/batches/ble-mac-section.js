import React from 'react';
import Box from '@material-ui/core/Box';
import { MacList } from './mac-list';

export const BleMacSection = ({
  loading,
  setValidMacs,
}) => {
  return (
      <Box mt = { 2 }>
        <MacList
              setValidMacs = { setValidMacs }
              loading = { loading }
          />
    </Box>
  );
};
