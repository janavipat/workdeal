import { SET_LOCATION, LocationAction } from '../action/Locationaction';

// Interface for Location State
export interface LocationState {
  latitude: number | null;
  longitude: number | null;
}

// Initial State
const initialState: LocationState = {
  latitude: null,
  longitude: null,
};

// Reducer Function
const LocationReducer = (state: LocationState = initialState, action: LocationAction): LocationState => {
  switch (action.type) {
    case SET_LOCATION:
      return {
        ...state,
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      };
    default:
      return state;
  }
};

export default LocationReducer;
