import { Container } from 'typedi';
jest.setTimeout(20000);
Container.set('bind-db-name', 'imatrix_bind_test');
Container.set('imatrix-db-name', 'imatrix_test');