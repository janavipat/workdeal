
export const SET_LOCATION = 'SET_LOCATION';

// Action Creators
export const setLocation = (latitude: number, longitude: number) => ({
  type: SET_LOCATION as typeof SET_LOCATION,
  payload: { latitude, longitude },
});


export type LocationAction = ReturnType<typeof setLocation>;
