import fetchApi from "../helpers/fetchApi";
import * as R from 'ramda';

export default store => next => action => {
  const filterWithKeys = pred => R.pipe(
    R.toPairs,
    R.filter(R.apply(pred)),
    R.fromPairs
  );

  const matchSettings = (key, val) => /Settings$/.test(key);

  let result = next(action)
  if(/SETTINGS$/.test(action.type)) {
    fetchApi("settings", action ).catch(error => {
        console.log("oops!",error)
    });
    store.dispatch({
      type: "server/setSettings",
      action: filterWithKeys(matchSettings)(store.getState())
    });
  }

 return result
}
