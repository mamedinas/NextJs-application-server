import React from "react";
import { Table } from 'reactstrap';

import Nav from '../components/nav'; // TODO use HOC
import styleBootstrap from 'bootstrap/dist/css/bootstrap.css';

export default class extends React.Component {
  static async getInitialProps({ req, query }) {
    const { projects } = query;
    return { projects };
  }

  render() {
    const { props: { projects = [] } } = this;

    return (
      <div>
        <style dangerouslySetInnerHTML={{ __html: styleBootstrap }} />
        <Nav />
        <Table striped hover>
          <thead>
            <tr>
              <th>Status</th>
              <th>Patient Name</th>
              <th>Study Name</th>
              <th>Study Date</th>
              <th>Modality</th>
              <th>Activity</th>
              <th>Location</th>
              <th>Client</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(({
              studyUID,
              status,
              patientName,
              studyName,
              studyDate,
              modality,
              activity,
              share,
              client = 'NHF',
        }) => (
                <tr onClick={() => window.location = `/project/${studyUID}`}>
                  <td>{status}</td>
                  <td>{patientName}</td>
                  <td>{studyName}</td>
                  <td>{studyDate}</td>
                  <td>{modality}</td>
                  <td>{activity}</td>
                  <td>{share}</td>
                  <td>{client}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    );
  }
}
