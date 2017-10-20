import React from "react";
import { Table } from "reactstrap";
import SearchInput from "./SearchInput";
import uuid from "uuid";

export default props => {
  const {
    data = [],
    header = {},
    filter = {},
    sortKey = "",
    sortDesc = false,
    onRowClick = () => {},
    onFilter = () => {},
    onSort = () => {},
  } = props;

  //striped hover
  return <div className="root">
      <style jsx>
        {`.root {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
          }
          .fieldFilter {
            padding: 0.4em;
            border: none;
          }

          .fieldColor {
            background: #ddd;
          }

          .headerCell {
            white-space: nowrap;
            cursor: pointer;
            border: none;
            user-select: none;
          }

          .headerCellDisabled {
            white-space: nowrap;
            padding: 0.65em;
            pointer-events: none;
            user-select: none;
          }

          .headerCell:hover {
            background: #d5d5d5;
          }

          .headerCell--active {
            background: #ddd;
          }

          .headerCellSort {
            width: 100%;
            height: 0.25em;
            background: #1bf;
          }
          .headerTab {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-right: 0.2rem;
          }

          .dataCellSort {
            background: #e0f4ff;
          }

          .dataCell {
            padding: 0 0.65em 0 0.65em;
            vertical-align: middle;
          }

          .arrow {
            display: inline-block;
            position: relative;
            margin-left: 20px;
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid #292b2c;
            transition: cubic-bezier(0.52, 0.13, 0, 1.07) 0.2s all;
          }

          .arrow--up {
            transform: rotate(180deg);
          }
        `}
      </style>

      <Table striped>
        <thead>
          <tr>
            {Object.entries(header).map(
              ([id, { title = "", sort = false }]) => (
                <th
                  className={`${sort
                    ? "headerCell"
                    : "headerCellDisabled"} ${id === sortKey
                    ? "headerCell--active"
                    : null}`}
                  key={`${title}-${id}`}
                  onClick={() => onSort(id)}
                >
                  <div className="headerTab">
                    {title}
                    {id === sortKey && sort ? (
                      <div
                        className={`arrow ${sortDesc ? "arrow--up" : null}`}
                      />
                    ) : null}
                  </div>
                </th>
              )
            )}
          </tr>
          <tr className="fieldColor">
            {Object.entries(header).map(([id, { sort }]) => (
              <td className="fieldFilter" key={`${id}-filter`}>
                {filter[id] !== undefined ? (
                  <SearchInput
                    type="text"
                    name={`filter-${id}`}
                    value={filter[id]}
                    onClear={() => onFilter([id, ""])}
                    onChange={({ target: { value } = {} }) =>
                      onFilter([id, value])}
                  />
                ) : null}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(dataProps => (
            <tr key={uuid()} onClick={() => onRowClick(dataProps)}>
              {Object.entries(header)
                .map(([id, props]) => ({
                  ...props,
                  data: dataProps[id]
                }))
                .map(({ id, data, type, title, action }) => (
                  <td className="dataCell" key={uuid()}>{data}</td>
                ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>;
};
