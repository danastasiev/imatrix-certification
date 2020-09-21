CREATE DATABASE IF NOT EXISTS imatrix;
USE imatrix;

CREATE TABLE IF NOT EXISTS device (
  cpuid varchar(128) NOT NULL,
  product_id varchar(10) NOT NULL,
  sn varchar(15) NOT NULL,
  mac varchar(20) NOT NULL,
  pw varchar(32) NOT NULL,
  PRIMARY KEY (cpuid, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS certs_log (
    sn VARCHAR(15) NOT NULL,
    issued_date DATETIME DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    PRIMARY KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;