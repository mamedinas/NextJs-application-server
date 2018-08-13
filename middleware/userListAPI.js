import {
  DELETE_USER,
  CREATE_USER,
  EDIT_USER,
  CREATE_TEAM,
  GET_TEAMS
} from "../constants/actionTypes";

const userListAPI = store => next => action => {
  const { type, userId, userData, teamData, teams} = action;

  switch (type) {
    case DELETE_USER:
      store.dispatch({
        type: "server/deleteUser",
        userId
      });
      break;
    case CREATE_USER:
      store.dispatch({
        type: "server/createUser",
        userData
      });
      break;
    case EDIT_USER:
      store.dispatch({
        type: "server/editUser",
        userData
      });
    case CREATE_TEAM:
      store.dispatch({
        type: "server/createTeam",
        teamData
      });
      break;
    default:
      break;
      //TODO: add EDIT_USER case
  }
  const result = next(action);
  return result;
};

export default userListAPI;
