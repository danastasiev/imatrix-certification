export const validateMacStructure = (mac) => /^([0-9a-fA-F]{2}[:]?){5}([0-9a-fA-F]{2})$/.test(mac);
export const SEQUENCE = 'SEQUENCE';
export const MANUAL = 'MANUAL';