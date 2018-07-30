import { PROJECTS_SET_SETTINGS } from "../constants/actionTypes";

const initialState = {
  filter: {},
  sortKey: "status",
  sortDesc: false,
  projectsListSortKey: "status",
  projectsListSortDesc: false
};

export default (
  state = initialState,
  { type, settings: { sortKey, filter = {}, ...settings } = {} }
) => {
  switch (type) {
    // TODO This is used in two places.  Should a utility/helper function?
    case PROJECTS_SET_SETTINGS:
      return {
        ...state,
        sortKey: sortKey !== undefined ? sortKey : state.sortKey,
        sortDesc:
          sortKey !== undefined // TODO Handle this in action?
            ? state.sortKey === sortKey
              ? !state.sortDesc
              : state.sortDesc
            : state.sortDesc,
        ...settings,
        // TODO Handle this in an action instead
        // Merge filters if any
        filter: {
          ...state.filter,
          ...filter
        }
      };
    default:
      return state;
  }
};
