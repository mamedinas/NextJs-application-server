import {
  createStore,
  applyMiddleware,
  compose,
  combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import persistProjects from './persistProjects';
import * as reducers from '../reducers';
import adapterSQLite from './adapterSQLite';
import adapterAzureSQL from './adapterAzureSQL';
import adapter from './adapter';

const enhancer = compose(
  persistProjects(adapter()),
  applyMiddleware(thunk)
);

export default (adapter) =>
  createStore(
    combineReducers({ ...reducers }),
    {},
    enhancer
  );
