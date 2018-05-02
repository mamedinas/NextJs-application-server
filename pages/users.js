import { Component } from "react";
import withRedux from "next-redux-wrapper";
import { bindActionCreators } from "redux";
import { Button } from "reactstrap";
import EditIcon from "react-icons/lib/md/edit";
import DeleteIcon from "react-icons/lib/md/delete";

import Wrapper from "../hoc/wrapper";
import { initStore } from "../store";
import * as actions from "../actions";
import MediaCardIdentity from "../components/MediaCardIdentity";
import MediaCardHeader from "../components/MediaCardHeader";
import MediaCardContent from "../components/MediaCardContent";
import ActionGroup from "../components/ActionGroup";
import IconButton from "../components/IconButton";
import MediaCardGroup from "../components/MediaCardGroup";
import MediaCard from "../components/MediaCard";
import CreateUserModal from "../components/CreateUserModal";
import EditUserModal from "../components/EditUserModal";

class Users extends Component {
  static async getInitialProps({
    store,
    isServer,
    query: { users = [] }
  }) {
    const { payloadUsers, fetchAction } = actions;

    if (isServer) {
      //TODO Should we wrap these in a single action?
      store.dispatch(payloadUsers({ data: users }));
      return;
    }

    store.dispatch(fetchAction(true));
    store.dispatch({ type: "server/pageUsers" });
  }

  constructor(props) {
    super(props);
    this.state = {
      currentUser: {},
      createUserModal: false,
      editUserModal: false
    };
  }

  toggleCreateUserModal = () => {
    const { createUserModal } = this.state;
    this.setState({
      createUserModal: !createUserModal
    });
  };

  toggleEditUserModal = user => {
    console.log("currentUser", user);
    const { editUserModal, currentUser } = this.state;
    this.setState({
      currentUser: editUserModal ? currentUser : user,
      editUserModal: !editUserModal
    });
  };

  render() {
    const {
      deleteUser,
      createUser,
      editUser,
      userList: { data, fetching }
    } = this.props;

    return (
      <div className="root">
        <style jsx>{`
          .root {
            background: #eceeef;
          }
        `}</style>
        <MediaCardHeader>
          <MediaCardIdentity>Name</MediaCardIdentity>
          <MediaCardContent>Email/User Name</MediaCardContent>
          <ActionGroup>
            <Button
              onClick={this.toggleCreateUserModal}
              color="primary"
              size="sm"
            >
              Create User
            </Button>
          </ActionGroup>
        </MediaCardHeader>
        <MediaCardGroup>
          {data.map(user => (
            <MediaCard key={user.id}>
              <MediaCardIdentity>{user.name}</MediaCardIdentity>
              <MediaCardContent>{user.username}</MediaCardContent>
              <ActionGroup>
                <IconButton
                  onClick={() => this.toggleEditUserModal(user)}
                >
                  <EditIcon size="25px" />
                </IconButton>
                <IconButton onClick={() => deleteUser(user.id)}>
                  <DeleteIcon size="25px" />
                </IconButton>
              </ActionGroup>
            </MediaCard>
          ))}
        </MediaCardGroup>
        <CreateUserModal
          onSubmit={createUser}
          isOpen={this.state.createUserModal}
          toggle={this.toggleCreateUserModal}
        />
        <EditUserModal
          user={this.state.currentUser}
          onSubmit={editUser}
          isOpen={this.state.editUserModal}
          toggle={this.toggleEditUserModal}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ userList }) => ({ userList });

const mapDispatchToProps = dispatch =>
  bindActionCreators(actions, dispatch);

export default withRedux(
  initStore,
  mapStateToProps,
  mapDispatchToProps
)(Wrapper(Users));