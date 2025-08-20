import { joinURL } from "ufo";
import { DISCUSS_KIT_DID } from "./constants.js";
import { getCurrentUser } from "./user.js";
import { getComponentMountPoint } from "./utils/get-component-mount-point.js";

// Custom error class for board name conflicts
export class BoardNameExistsError extends Error {
  constructor(boardName: string) {
    super(`Project name "${boardName}" already exists. Please modify the name and try again.`);
    this.name = "BoardNameExistsError";
  }
}

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
  cover: string;
  icon: string | null;
  passports: unknown[];
  translation: {
    title: Record<string, unknown>;
    desc: Record<string, unknown>;
  };
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

// Update board request interface
interface UpdateBoardRequest extends BaseBoard {}

// Update board response interface
interface UpdateBoardResponse extends BaseBoard {}

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

export async function updateBoard(input: {
  appUrl: string;
  accessToken: string;
  boardData: UpdateBoardRequest;
}): Promise<UpdateBoardResponse> {
  const { appUrl, accessToken, boardData } = input;

  const url = new URL(appUrl);
  const mountPoint = await getComponentMountPoint(appUrl, DISCUSS_KIT_DID);

  // Update board
  const updateBoardUrl = joinURL(url.origin, mountPoint, `/api/boards/${boardData.id}`);

  const updateBoardResponse = await fetch(updateBoardUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(boardData),
  });

  if (!updateBoardResponse.ok) {
    const errorText = await updateBoardResponse.text();
    throw new Error(
      `Failed to update board: ${updateBoardResponse.status} ${updateBoardResponse.statusText} - ${errorText}`,
    );
  }

  return await updateBoardResponse.json();
}

// Helper function to check if board needs update and perform update if needed
async function checkAndUpdateBoard(input: {
  appUrl: string;
  accessToken: string;
  existingBoard: BaseBoard;
  boardName?: string;
  desc: string;
  cover: string;
}): Promise<void> {
  const { appUrl, accessToken, existingBoard, boardName, desc, cover } = input;

  const titleChanged = boardName && existingBoard.title !== boardName;
  const descChanged = existingBoard.desc !== desc;
  const coverChanged = existingBoard.cover !== cover;

  if (titleChanged || descChanged || coverChanged) {
    await updateBoard({
      appUrl,
      accessToken,
      boardData: {
        ...existingBoard,
        title: boardName || existingBoard.title,
        desc,
        cover,
      },
    });
  }
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
  let boardsResponse: BoardListResponse | undefined;
  try {
    boardsResponse = await getBoards({ appUrl, accessToken });
    const existingBoard = boardsResponse.boards.find((board) => board.id === boardId);

    if (existingBoard) {
      // Check and update board if needed
      await checkAndUpdateBoard({
        appUrl,
        accessToken,
        existingBoard,
        boardName,
        desc,
        cover,
      });

      return existingBoard.id;
    }
  } catch (error) {
    console.warn(`Failed to get boards list: ${error}`);
    // Continue to create board if we can't get the list
  }

  // If boardId not found and boardName is provided, check by boardName
  if (boardName) {
    const boardWithSameName = boardsResponse?.boards?.find((board) => board.title === boardName);

    if (boardWithSameName) {
      // Get current user to check if they created this board
      try {
        const currentUser = await getCurrentUser({ appUrl, accessToken });

        if (currentUser.user.did === boardWithSameName.createdBy) {
          // Same board name and created by current user, check for updates
          await checkAndUpdateBoard({
            appUrl,
            accessToken,
            existingBoard: boardWithSameName,
            boardName,
            desc,
            cover,
          });

          return boardWithSameName.id;
        } else {
          // Board name exists but created by different user, throw error
          throw new BoardNameExistsError(boardName);
        }
      } catch (error) {
        if (error instanceof BoardNameExistsError) {
          throw new BoardNameExistsError(boardName);
        }

        console.warn(`Failed to get current user: ${error}`);
      }
    }
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
