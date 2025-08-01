import { joinURL } from "ufo";
import { DISCUSS_KIT_DID } from "./constants.js";
import { getComponentMountPoint } from "./utils/get-component-mount-point.js";

// Base board interface with common fields
interface BaseBoard {
  id: string;
  title: string;
  desc: string;
  type: string;
  createdBy: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// Create board request interface
interface CreateBoardRequest {
  title: string;
  desc: string;
  passports: unknown[];
  cover: string;
  type: string;
  translation: {
    title: Record<string, unknown>;
    desc: Record<string, unknown>;
  };
}

// Create board response interface
interface CreateBoardResponse extends BaseBoard {
  passports: unknown[];
  translation: {
    title: Record<string, unknown>;
    desc: Record<string, unknown>;
  };
  cover: string;
}

export async function createBoard(input: {
  appUrl: string;
  accessToken: string;
  boardName: string;
}): Promise<string> {
  const { appUrl, accessToken, boardName } = input;

  const url = new URL(appUrl);
  const mountPoint = await getComponentMountPoint(appUrl, DISCUSS_KIT_DID);

  // Create new board
  const createBoardUrl = joinURL(url.origin, mountPoint, "/api/boards");
  const createBoardData: CreateBoardRequest = {
    title: boardName,
    desc: "",
    passports: [],
    cover: "",
    type: "doc",
    translation: {
      title: {},
      desc: {},
    },
  };

  const createBoardResponse = await fetch(createBoardUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(createBoardData),
  });

  if (!createBoardResponse.ok) {
    const errorText = await createBoardResponse.text();
    throw new Error(
      `Failed to create board: ${createBoardResponse.status} ${createBoardResponse.statusText} - ${errorText}`,
    );
  }

  const newBoard: CreateBoardResponse = await createBoardResponse.json();
  return newBoard.id;
}
