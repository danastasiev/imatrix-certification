CREATE DATABASE IF NOT EXISTS `imatrix_bind_test`;
USE `imatrix_bind_test`;
CREATE TABLE IF NOT EXISTS `device` (
  `cpuid` varchar(128) DEFAULT NULL,
  `product_id` int(10) unsigned DEFAULT NULL,
  `sn` int(10) unsigned zerofill DEFAULT NULL,
  `mac` bigint(20) unsigned DEFAULT NULL,
  `pw` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS certs_log (
    sn VARCHAR(15) NOT NULL,
    issued_date DATETIME DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE DATABASE IF NOT EXISTS `imatrix_test`;
USE `imatrix_test`;

CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    PRIMARY KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;