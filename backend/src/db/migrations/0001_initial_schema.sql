CREATE DATABASE IF NOT EXISTS imatrix_bind;
USE imatrix_bind;

CREATE TABLE IF NOT EXISTS device (
  cpuid varchar(128),
  product_id varchar(50) NOT NULL,
  sn varchar(15) NOT NULL,
  mac varchar(20) NOT NULL,
  pw varchar(32) NOT NULL,
  PRIMARY KEY (sn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS certs_log (
    sn VARCHAR(15) NOT NULL,
    issued_date DATETIME DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS batch (
  batch_id varchar(50) NOT NULL,
  product_id varchar(50) NOT NULL,
  batch_type varchar(10) NOT NULL,
  description varchar(80),
  created DATETIME DEFAULT NOW(),
  PRIMARY KEY (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS batch_device (
  batch_id varchar(50) NOT NULL,
  sn varchar(50) NOT NULL,
  PRIMARY KEY (batch_id, sn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;