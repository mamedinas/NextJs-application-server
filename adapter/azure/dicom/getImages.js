import azure from "azure-storage";
// import queryTable from "./helpers/queryTable";
import { queryTable } from "../table";
// import { tablePrefix } from "./";

export default async ({ seriesUID, tablePrefix, tableService }) => {
  const images = await queryTable({
    query: new azure.TableQuery()
      .select([
        "instanceUID",
        "bitsAllocated",
        "bitsStored",
        "highbit",
        "columns",
        "rows",
        "imageNumber",
        "imageOrientation",
        "imagePosition",
        "pixelAspectRatio",
        "pixelSpacing",
        "sliceThickness",
        "windowCenter",
        "windowWidth"
      ])
      .where("seriesUID eq ?", seriesUID),
    tableName: `${tablePrefix}Images`,
    tableService
  });

  return images
    .sort((a, b) => a.imageNumber - b.imageNumber)
    .map(
      ({
        instanceUID,
        bitsAllocated,
        bitsStored,
        highbit,
        columns,
        rows,
        imageNumber,
        imageOrientation,
        imagePosition,
        pixelAspectRatio,
        pixelSpacing,
        sliceThickness,
        windowCenter,
        windowWidth
      }) => ({
        instanceUID,
        bitsAllocated,
        bitsStored,
        highbit,
        columns,
        rows,
        imageNumber,
        imageOrientation: JSON.parse(imageOrientation),
        imagePosition: JSON.parse(imagePosition),
        pixelAspectRatio: JSON.parse(pixelAspectRatio),
        pixelSpacing: JSON.parse(pixelSpacing),
        sliceThickness,
        windowCenter,
        windowWidth
      })
    );
};
