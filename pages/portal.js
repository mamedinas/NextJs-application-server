import React, { Component } from "react";
import withRedux from "next-redux-wrapper";
import { bindActionCreators } from "redux";
import { Button, ButtonGroup, Table, Input } from "reactstrap";
import { initStore } from "../store";
import * as actions from "../actions";
import selectProjectList from "../selectors/selectProjectList";

import Wrapper from "../hoc/wrapper";
import TableList from "../components/TableList";
import VideoModal from "../containers/videoModal";
import UploadFilePopup from "../components/UploadFilePopup";
import UploadButton from "../components/UploadButton";

// TODO Move to separate file?
const CellTableWrapper = (array, key) => (
  <Table
    style={{
      margin: 0,
      padding: 0,
      background: "inherit",
      height: "100%"
    }}
  >
    <tbody>
      {array.map(({ [key]: value }, i) => (
        <tr
          key={`cell-table-wrapper-${key}-${i}`}
          style={{ background: "inherit" }}
        >
          <td
            style={{ margin: 0, padding: 0, verticalAlign: "middle" }}
          >
            {value}
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

const Portal = class extends Component {
  static async getInitialProps({
    store,
    isServer,
    // userId: clientID,
    query: { portalList = {}, portalSettings = {} } = {}
  }) {
    const { payloadPortal, setPortalSettings, fetchAction } = actions;

    if (isServer) {
      // TODO Should we wrap these in single action?
      store.dispatch(payloadPortal({ portalList }));
      store.dispatch(setPortalSettings(portalSettings));
      return;
    }

    store.dispatch(fetchAction(true));
    store.dispatch({ type: "server/pagePortal" });
  }

  // TODO Remove handle using redux portalSettings or portal?
  constructor(props) {
    super(props);

    // TODO Move to redux?
    this.state = {
      popupTarget: null,
      popupStudyUID: ""
    };
  }

  // TODO Move to redux action?
  popupOpen({ target, studyUID }) {
    this.setState({
      popupTarget: target,
      popupStudyUID: studyUID
    });
  }

  // TODO Move to redux action?
  popupToggle() {
    this.setState({
      popupTarget: null
    });
  }

  render() {
    const {
      props: {
        tableData = [],
        tableHeader = {},
        tableSettings = {},
        tableSubHeader = {},
        admin = false,
        setPortalSettings = () => {},
        setVideo = () => {},
        setMetaData = () => {},
        uploadDel = () => {},
        handleUpload = () => {}
      },
      state: { popupTarget, popupStudyUID }
    } = this;

    // TODO Move this to prop mapping instead and remove from component class?
    const tableHeaderEnhanced = admin
      ? {
          client: { title: "Client", sort: true },
          ...tableHeader
        }
      : tableHeader;

    // TODO Move this to prop mapping instead and remove from component class?
    const tableDataEnhanced = tableData.map(
      (
        {
          studyUID,
          patientID,
          videoExists = false,
          patientName,
          client,
          patientBirthDate,
          studies = []
        },
        j
      ) => {
        const studiesEnhanced = studies.map(
          (
            {
              studyUID,
              videoExists,
              uploadedFiles = [],
              multusID = "",
              ...study
            },
            i
          ) => {
            const popoverID = `file-popover-${j}-${i}`;

            return {
              ...study,
              multusID: (
                <Input
                  placeholder=""
                  value={multusID}
                  style={
                    multusID === "" ? { background: "#ff8989" } : {}
                  }
                  onChange={({ target: { value = "" } }) => {
                    setMetaData({
                      studyUID,
                      props: { multusID: value }
                    });
                  }}
                />
              ),
              upload: (
                <ButtonGroup>
                  {uploadedFiles.length > 0 ? (
                    <Button
                      id={popoverID}
                      color="success"
                      onClick={() =>
                        this.popupOpen({
                          studyUID,
                          target: popoverID
                        })
                      }
                    >
                      {uploadedFiles.length}
                    </Button>
                  ) : null}
                  <UploadButton
                    studyUID={studyUID}
                    hasFiles={uploadedFiles.length > 0}
                    handleUpload={handleUpload}
                  />
                </ButtonGroup>
              ),
              video: videoExists ? (
                <a
                  href={`/video/?id=${studyUID}&patientName=${patientName}`}
                  target="_videoPreview"
                >
                  Download Video
                </a>
              ) : (
                "No Video"
              )
            };
          }
        );

        return {
          client,
          patientBirthDate,
          patientName: `${patientName} (${patientID})`,
          studies: CellTableWrapper(studiesEnhanced, "studyName"),
          multusID: CellTableWrapper(studiesEnhanced, "multusID"),
          studyDate: CellTableWrapper(studiesEnhanced, "studyDate"),
          statusName: CellTableWrapper(studiesEnhanced, "statusName"),
          // modality: CellTableWrapper(studiesEnhanced, "modality"),
          location: CellTableWrapper(studiesEnhanced, "location"),
          uploadDateTime: CellTableWrapper(
            studiesEnhanced,
            "uploadDateTime"
          ),
          upload: CellTableWrapper(studiesEnhanced, "upload"),
          video: CellTableWrapper(studiesEnhanced, "video")
        };
      }
    );

    // Query the study from tableData
    let study;
    const ret = tableData.some(
      ({ studies = [] }) =>
        (study = studies.find(
          ({ studyUID = "" }) => studyUID === popupStudyUID
        )) !== undefined
    );
    const { uploadedFiles = [] } = study || {};

    return (
      <div className="portal">
        <style jsx>
          {`
            .custom-file-upload {
              border: 1px solid #ccc;
              display: inline-block;
              padding: 6px 12px;
              cursor: pointer;
            }

            .portal {
              display: flex;
              flex-direction: column;
              width: 100%;
              height: 100%;
              overflow: auto;
            }

            .tooltip-inner {
              background: white;
            }

            .popupFiles {
              border-radius: 0px;
              background: white;
            }
          `}
        </style>
        <TableList
          data={tableDataEnhanced}
          header={tableHeaderEnhanced}
          onSort={k => setPortalSettings({ sortKey: k })}
          onFilter={([k, v]) =>
            setPortalSettings({
              filter: { [k]: v }
            })
          }
          {...tableSettings}
        />
        <VideoModal />
        <UploadFilePopup
          popupTarget={popupTarget}
          fileList={uploadedFiles}
          toggle={() => this.popupToggle()}
          studyUID={popupStudyUID}
          onDelete={props => {
            uploadDel(props);
            if (uploadedFiles.length <= 1) {
              this.setState({ popupTarget: null });
            }
          }}
        />
      </div>
    );
  }
};

const mapStateToProps = ({
  portal: { portalList = [] },
  portalSettings = {}
}) => ({
  tableHeader: {
    patientName: { title: "Patient Name", sort: true },
    patientBirthDate: { title: "Patient DOB", sort: true },
    studies: { title: "Studies", sort: false },
    multusID: { title: "Multus ID", sort: true },
    studyDate: { title: "Study Date", sort: true },
    statusName: { title: "Status", sort: true },
    // modality: { title: "Modality", sort: true },
    location: { title: "Imaging Center", sort: true },
    uploadDateTime: { title: "Date Uploaded", sort: true },
    upload: { title: "Attach Records", sort: false },
    // TODO Create Download button for all files
    video: { title: "Download", sort: false }
    // download: { title: "Download", sort: false }
  },
  tableSettings: portalSettings,
  tableData: selectProjectList({
    projects: portalList,
    settings: portalSettings
  })
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(actions, dispatch);

export default withRedux(
  initStore,
  mapStateToProps,
  mapDispatchToProps
)(Wrapper(Portal));

/*
<Button onClick={() => setVideo(studyUID)}>
                  Video
                </Button>
                */
