import { getStudy } from "../dicom";
import { getProject } from "../projects";
import { getUserProps } from "../authUsers";
import { list as uploadList } from "../upload";

export default async ({ studyUID = 0 }) => {
  const { clientID = 0, ...study } = await getStudy({ studyUID });
  const project = await getProject({ studyUID });
  const uploadedFiles = await uploadList({ studyUID });
  const { name: client } = await getUserProps(clientID, ["name"]);

  // Merge project and study table
  return {
    ...project,
    ...study,
    studyUID,
    uploadedFiles,
    client
  };
};
