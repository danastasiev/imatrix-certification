CREATE DATABASE IF NOT EXISTS imatrix_test;
USE imatrix_test;

CREATE TABLE IF NOT EXISTS users
(
	uid int unsigned auto_increment not null comment 'Primary Key: Unique user ID.'
		primary key,
	name varchar(60) default '' not null comment 'Unique user name.',
	pass varchar(128) default '' not null comment 'User’s password (hashed).',
	mail varchar(254) default '' null comment 'User’s e-mail address.',
	theme varchar(255) default '' not null comment 'User’s default theme.',
	signature varchar(255) default '' not null comment 'User’s signature.',
	signature_format varchar(255) null comment 'The filter_format.format of the signature.',
	created int default 0 not null comment 'Timestamp for when user was created.',
	access int default 0 not null comment 'Timestamp for previous time user accessed the site.',
	login int default 0 not null comment 'Timestamp for user’s last login.',
	status tinyint default 0 not null comment 'Whether the user is active(1) or blocked(0).',
	timezone varchar(32) null comment 'User’s time zone.',
	language varchar(12) default '' not null comment 'User’s default language.',
	picture int default 0 not null comment 'Foreign key: file_managed.fid of user’s picture.',
	init varchar(254) default '' null comment 'E-mail address used for initial account creation.',
	data longblob null comment 'A serialized array of name value pairs that are related to the user. Any form values posted during user edit are stored and are loaded into the $user object during user_load(). Use of this field is discouraged and it will likely disappear in a future...',
	constraint name
		unique (name)
)
comment 'Stores user data.' engine=InnoDB;

CREATE TABLE IF NOT EXISTS product (
  product_id varchar(50) NOT NULL,
  name varchar(40) NOT NULL,
  PRIMARY KEY (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE DATABASE IF NOT EXISTS imatrix_bind_test;
USE imatrix_bind_test;

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
  created DATETIME DEFAULT NOW(),
  PRIMARY KEY (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS batch_device (
  batch_id varchar(50) NOT NULL,
  sn varchar(50) NOT NULL,
  PRIMARY KEY (batch_id, sn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;