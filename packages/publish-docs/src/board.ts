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

// Board list response interface
interface BoardListResponse {
  boards: BaseBoard[];
  defaults: {
    discussion: string;
    blog: string;
    doc: string;
    bookmark: string;
  };
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

export async function getBoards(input: {
  appUrl: string;
  accessToken: string;
}): Promise<BoardListResponse> {
  const { appUrl, accessToken } = input;

  const url = new URL(appUrl);
  const mountPoint = await getComponentMountPoint(appUrl, DISCUSS_KIT_DID);

  // Get boards list
  const getBoardsUrl = joinURL(url.origin, mountPoint, "/api/boards");

  const getBoardsResponse = await fetch(getBoardsUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!getBoardsResponse.ok) {
    const errorText = await getBoardsResponse.text();
    throw new Error(
      `Failed to get boards: ${getBoardsResponse.status} ${getBoardsResponse.statusText} - ${errorText}`,
    );
  }

  return await getBoardsResponse.json();
}

export async function findOrCreateBoard(input: {
  appUrl: string;
  accessToken: string;
  boardId: string;
  boardName?: string;
  desc?: string;
  cover?: string;
}): Promise<string> {
  const { appUrl, accessToken, boardId, boardName, desc = "", cover = "" } = input;

  // First, try to get existing boards
  try {
    const boardsResponse = await getBoards({ appUrl, accessToken });
    const existingBoard = boardsResponse.boards.find((board) => board.id === boardId);

    if (existingBoard) {
      return existingBoard.id;
    }
  } catch (error) {
    console.warn(`Failed to get boards list: ${error}`);
    // Continue to create board if we can't get the list
  }

  // Board doesn't exist, create it
  if (!boardName) {
    throw new Error("boardName is required when creating a new board");
  }

  return await createBoard({
    appUrl,
    accessToken,
    boardName,
    desc,
    cover,
  });
}

export async function createBoard(input: {
  appUrl: string;
  accessToken: string;
  boardName: string;
  desc?: string;
  cover?: string;
}): Promise<string> {
  const { appUrl, accessToken, boardName, desc = "", cover = "" } = input;

  const url = new URL(appUrl);
  const mountPoint = await getComponentMountPoint(appUrl, DISCUSS_KIT_DID);

  // Create new board
  const createBoardUrl = joinURL(url.origin, mountPoint, "/api/boards");
  const createBoardData: CreateBoardRequest = {
    title: boardName,
    desc,
    passports: [],
    cover,
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
