import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { Close } from '@material-ui/icons';

export const UploadFileSection = ({ setFile, loading }) => {
  const [filename, setFilename] = useState('');
  const [inputRef, setInputRef] = useState(null);
  useEffect(() => () => setFile(null), []);

  return (
    <Box alignItems = 'center' display = 'flex' mt = { 2 } width = '100%'>
      <Button
        variant = 'outlined'
        component = 'label'
        size = 'small'
        color = 'primary'
        disabled = { loading }>
        Upload File
        <input
          type = 'file'
          multiple = { false }
          onChange = { ({ target }) => {
            setFilename(target.files[0].name);
            setFile(target.files[0]);
          } }
          ref={ref => setInputRef(ref)}
          style = { { display: 'none' } }
          />
        </Button>
      <Box ml = { 2 }>
        <Typography>
          { filename }
          </Typography>
        </Box>
      {
        filename && (
          <Box ml = { 1 }>
            <IconButton
              onClick = { () => {
                setFile(null);
                setFilename('');
                inputRef.value = null;
              } }>
              <Close />
            </IconButton>
          </Box>
        )
      }
    </Box>
  );
};
