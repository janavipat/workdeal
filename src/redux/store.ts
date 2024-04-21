import { createStore, combineReducers, Store } from 'redux';
import LocationReducer, { LocationState } from './reducer/Locationrecuder';

// Interface for Application State
export interface RootState {
  location: LocationState;
}

// Combine Reducers
const rootReducer = combineReducers<RootState>({
  location: LocationReducer,
});

// Create Store
const store: Store<RootState> = createStore(rootReducer);

export default store;
