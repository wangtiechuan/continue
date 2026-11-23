import generateRepoMap from "../../util/generateRepoMap";

import { ToolImpl } from ".";

export const viewRepoMapImpl: ToolImpl = async (args, extras) => {
  const repoMap = await generateRepoMap(extras.llm, extras.ide, {
    outputRelativeUriPaths: true,
    includeSignatures: true,
  });
  return [
    {
      name: "仓库地图",
      description: "仓库结构概览",
      content: repoMap,
    },
  ];
};
