// biome-ignore-all lint/style/noNonNullAssertion: code is from gemini-cli
// biome-ignore-all lint/correctness/useExhaustiveDependencies: code is from gemini-cli

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  cpLen,
  cpSlice,
  getCachedStringWidth,
  stripUnsafeCharacters,
  toCodePoints,
} from "./text-utils.js";

export type Direction =
  | "left"
  | "right"
  | "up"
  | "down"
  | "wordLeft"
  | "wordRight"
  | "home"
  | "end";

// Simple helper for word‑wise ops.
function isWordChar(ch: string | undefined): boolean {
  if (ch === undefined) {
    return false;
  }
  return !/[\s,.;!?]/.test(ch);
}

// Helper functions for line-based word navigation
const isWordCharStrict = (char: string): boolean => /[\w\p{L}\p{N}]/u.test(char);

const isWhitespace = (char: string): boolean => /\s/.test(char);

const isCombiningMark = (char: string): boolean => /\p{M}/u.test(char);

const isWordCharWithCombining = (char: string): boolean =>
  isWordCharStrict(char) || isCombiningMark(char);

const getCharScript = (char: string): string => {
  if (/[\p{Script=Latin}]/u.test(char)) return "latin";
  if (/[\p{Script=Han}]/u.test(char)) return "han";
  if (/[\p{Script=Arabic}]/u.test(char)) return "arabic";
  if (/[\p{Script=Hiragana}]/u.test(char)) return "hiragana";
  if (/[\p{Script=Katakana}]/u.test(char)) return "katakana";
  if (/[\p{Script=Cyrillic}]/u.test(char)) return "cyrillic";
  return "other";
};

const isDifferentScript = (char1: string, char2: string): boolean => {
  if (!isWordCharStrict(char1) || !isWordCharStrict(char2)) return false;
  return getCharScript(char1) !== getCharScript(char2);
};

const findNextWordStartInLine = (line: string, col: number): number | null => {
  const chars = toCodePoints(line);
  let i = col;

  if (i >= chars.length) return null;

  const currentChar = chars[i]!;

  // Skip current word/sequence based on character type
  if (isWordCharStrict(currentChar)) {
    while (i < chars.length && isWordCharWithCombining(chars[i]!)) {
      // Check for script boundary - if next character is from different script, stop here
      if (
        i + 1 < chars.length &&
        isWordCharStrict(chars[i + 1]!) &&
        isDifferentScript(chars[i]!, chars[i + 1]!)
      ) {
        i++; // Include current character
        break; // Stop at script boundary
      }
      i++;
    }
  } else if (!isWhitespace(currentChar)) {
    while (i < chars.length && !isWordCharStrict(chars[i]!) && !isWhitespace(chars[i]!)) {
      i++;
    }
  }

  // Skip whitespace
  while (i < chars.length && isWhitespace(chars[i]!)) {
    i++;
  }

  return i < chars.length ? i : null;
};

// Find previous word start within a line
const findPrevWordStartInLine = (line: string, col: number): number | null => {
  const chars = toCodePoints(line);
  let i = col;

  if (i <= 0) return null;

  i--;

  // Skip whitespace moving backwards
  while (i >= 0 && isWhitespace(chars[i]!)) {
    i--;
  }

  if (i < 0) return null;

  if (isWordCharStrict(chars[i]!)) {
    // We're in a word, move to its beginning
    while (i >= 0 && isWordCharStrict(chars[i]!)) {
      // Check for script boundary - if previous character is from different script, stop here
      if (
        i - 1 >= 0 &&
        isWordCharStrict(chars[i - 1]!) &&
        isDifferentScript(chars[i]!, chars[i - 1]!)
      ) {
        return i; // Return current position at script boundary
      }
      i--;
    }
    return i + 1;
  } else {
    // We're in punctuation, move to its beginning
    while (i >= 0 && !isWordCharStrict(chars[i]!) && !isWhitespace(chars[i]!)) {
      i--;
    }
    return i + 1;
  }
};

// Find word end within a line

// Find next word across lines

// Find previous word across lines

// Helper functions for vim line operations

const replaceRangeInternal = (
  state: TextBufferState,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  text: string,
): TextBufferState => {
  const currentLine = (row: number) => state.lines[row] || "";
  const currentLineLen = (row: number) => cpLen(currentLine(row));
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  if (
    startRow > endRow ||
    (startRow === endRow && startCol > endCol) ||
    startRow < 0 ||
    startCol < 0 ||
    endRow >= state.lines.length ||
    (endRow < state.lines.length && endCol > currentLineLen(endRow))
  ) {
    return state; // Invalid range
  }

  const newLines = [...state.lines];

  const sCol = clamp(startCol, 0, currentLineLen(startRow));
  const eCol = clamp(endCol, 0, currentLineLen(endRow));

  const prefix = cpSlice(currentLine(startRow), 0, sCol);
  const suffix = cpSlice(currentLine(endRow), eCol);

  const normalisedReplacement = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const replacementParts = normalisedReplacement.split("\n");

  // The combined first line of the new text
  const firstLine = prefix + replacementParts[0];

  if (replacementParts.length === 1) {
    // No newlines in replacement: combine prefix, replacement, and suffix on one line.
    newLines.splice(startRow, endRow - startRow + 1, firstLine + suffix);
  } else {
    // Newlines in replacement: create new lines.
    const lastLine = replacementParts[replacementParts.length - 1]! + suffix;
    const middleLines = replacementParts.slice(1, -1);
    newLines.splice(startRow, endRow - startRow + 1, firstLine, ...middleLines, lastLine);
  }

  const finalCursorRow = startRow + replacementParts.length - 1;
  const finalCursorCol =
    (replacementParts.length > 1 ? 0 : sCol) +
    cpLen(replacementParts[replacementParts.length - 1]!);

  return {
    ...state,
    lines: newLines,
    cursorRow: Math.min(Math.max(finalCursorRow, 0), newLines.length - 1),
    cursorCol: Math.max(0, Math.min(finalCursorCol, cpLen(newLines[finalCursorRow]! || ""))),
    preferredCol: null,
  };
};

interface Viewport {
  height: number;
  width: number;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/* ────────────────────────────────────────────────────────────────────────── */

interface UseTextBufferProps {
  initialText?: string;
  initialCursorOffset?: number;
  viewport: Viewport;
  onChange?: (text: string) => void;
  isValidPath: (path: string) => boolean;
  shellModeActive?: boolean;
}

interface UndoHistoryEntry {
  lines: string[];
  cursorRow: number;
  cursorCol: number;
}

function calculateInitialCursorPosition(initialLines: string[], offset: number): [number, number] {
  let remainingChars = offset;
  let row = 0;
  while (row < initialLines.length) {
    const lineLength = cpLen(initialLines[row]!);
    // Add 1 for the newline character (except for the last line)
    const totalCharsInLineAndNewline = lineLength + (row < initialLines.length - 1 ? 1 : 0);

    if (remainingChars <= lineLength) {
      // Cursor is on this line
      return [row, remainingChars];
    }
    remainingChars -= totalCharsInLineAndNewline;
    row++;
  }
  // Offset is beyond the text, place cursor at the end of the last line
  if (initialLines.length > 0) {
    const lastRow = initialLines.length - 1;
    return [lastRow, cpLen(initialLines[lastRow]!)];
  }
  return [0, 0]; // Default for empty text
}

function offsetToLogicalPos(text: string, offset: number): [number, number] {
  let row = 0;
  let col = 0;
  let currentOffset = 0;

  if (offset === 0) return [0, 0];

  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineLength = cpLen(line!);
    const lineLengthWithNewline = lineLength + (i < lines.length - 1 ? 1 : 0);

    if (offset <= currentOffset + lineLength) {
      // Check against lineLength first
      row = i;
      col = offset - currentOffset;
      return [row, col];
    } else if (offset <= currentOffset + lineLengthWithNewline) {
      // Check if offset is the newline itself
      row = i;
      col = lineLength; // Position cursor at the end of the current line content
      // If the offset IS the newline, and it's not the last line, advance to next line, col 0
      if (offset === currentOffset + lineLengthWithNewline && i < lines.length - 1) {
        return [i + 1, 0];
      }
      return [row, col]; // Otherwise, it's at the end of the current line content
    }
    currentOffset += lineLengthWithNewline;
  }

  // If offset is beyond the text length, place cursor at the end of the last line
  // or [0,0] if text is empty
  if (lines.length > 0) {
    row = lines.length - 1;
    col = cpLen(lines[row]!);
  } else {
    row = 0;
    col = 0;
  }
  return [row, col];
}

/**
 * Converts logical row/col position to absolute text offset
 * Inverse operation of offsetToLogicalPos
 */

interface VisualLayout {
  visualLines: string[];
  logicalToVisualMap: Array<Array<[number, number]>>;
  visualToLogicalMap: Array<[number, number]>;
}

// Calculates the visual wrapping of lines and the mapping between logical and visual coordinates.
// This is an expensive operation and should be memoized.
function calculateLayout(logicalLines: string[], viewportWidth: number): VisualLayout {
  const visualLines: string[] = [];
  const logicalToVisualMap: Array<Array<[number, number]>> = [];
  const visualToLogicalMap: Array<[number, number]> = [];

  logicalLines.forEach((logLine, logIndex) => {
    logicalToVisualMap[logIndex] = [];
    if (logLine.length === 0) {
      // Handle empty logical line
      logicalToVisualMap[logIndex].push([visualLines.length, 0]);
      visualToLogicalMap.push([logIndex, 0]);
      visualLines.push("");
    } else {
      // Non-empty logical line
      let currentPosInLogLine = 0; // Tracks position within the current logical line (code point index)
      const codePointsInLogLine = toCodePoints(logLine);

      while (currentPosInLogLine < codePointsInLogLine.length) {
        let currentChunk = "";
        let currentChunkVisualWidth = 0;
        let numCodePointsInChunk = 0;
        let lastWordBreakPoint = -1; // Index in codePointsInLogLine for word break
        let numCodePointsAtLastWordBreak = 0;

        // Iterate through code points to build the current visual line (chunk)
        for (let i = currentPosInLogLine; i < codePointsInLogLine.length; i++) {
          const char = codePointsInLogLine[i];
          const charVisualWidth = getCachedStringWidth(char!);

          if (currentChunkVisualWidth + charVisualWidth > viewportWidth) {
            // Character would exceed viewport width
            if (
              lastWordBreakPoint !== -1 &&
              numCodePointsAtLastWordBreak > 0 &&
              currentPosInLogLine + numCodePointsAtLastWordBreak < i
            ) {
              // We have a valid word break point to use, and it's not the start of the current segment
              currentChunk = codePointsInLogLine
                .slice(currentPosInLogLine, currentPosInLogLine + numCodePointsAtLastWordBreak)
                .join("");
              numCodePointsInChunk = numCodePointsAtLastWordBreak;
            } else {
              // No word break, or word break is at the start of this potential chunk, or word break leads to empty chunk.
              // Hard break: take characters up to viewportWidth, or just the current char if it alone is too wide.
              if (numCodePointsInChunk === 0 && charVisualWidth > viewportWidth) {
                // Single character is wider than viewport, take it anyway
                currentChunk = char!;
                numCodePointsInChunk = 1;
              } else if (numCodePointsInChunk === 0 && charVisualWidth <= viewportWidth) {
                // This case should ideally be caught by the next iteration if the char fits.
                // If it doesn't fit (because currentChunkVisualWidth was already > 0 from a previous char that filled the line),
                // then numCodePointsInChunk would not be 0.
                // This branch means the current char *itself* doesn't fit an empty line, which is handled by the above.
                // If we are here, it means the loop should break and the current chunk (which is empty) is finalized.
              }
            }
            break; // Break from inner loop to finalize this chunk
          }

          currentChunk += char;
          currentChunkVisualWidth += charVisualWidth;
          numCodePointsInChunk++;

          // Check for word break opportunity (space)
          if (char === " ") {
            lastWordBreakPoint = i; // Store code point index of the space
            // Store the state *before* adding the space, if we decide to break here.
            numCodePointsAtLastWordBreak = numCodePointsInChunk - 1; // Chars *before* the space
          }
        }

        // If the inner loop completed without breaking (i.e., remaining text fits)
        // or if the loop broke but numCodePointsInChunk is still 0 (e.g. first char too wide for empty line)
        if (numCodePointsInChunk === 0 && currentPosInLogLine < codePointsInLogLine.length) {
          // This can happen if the very first character considered for a new visual line is wider than the viewport.
          // In this case, we take that single character.
          const firstChar = codePointsInLogLine[currentPosInLogLine]!;
          currentChunk = firstChar;
          numCodePointsInChunk = 1; // Ensure we advance
        }

        // If after everything, numCodePointsInChunk is still 0 but we haven't processed the whole logical line,
        // it implies an issue, like viewportWidth being 0 or less. Avoid infinite loop.
        if (numCodePointsInChunk === 0 && currentPosInLogLine < codePointsInLogLine.length) {
          // Force advance by one character to prevent infinite loop if something went wrong
          currentChunk = codePointsInLogLine[currentPosInLogLine]!;
          numCodePointsInChunk = 1;
        }

        logicalToVisualMap[logIndex].push([visualLines.length, currentPosInLogLine]);
        visualToLogicalMap.push([logIndex, currentPosInLogLine]);
        visualLines.push(currentChunk);

        const logicalStartOfThisChunk = currentPosInLogLine;
        currentPosInLogLine += numCodePointsInChunk;

        // If the chunk processed did not consume the entire logical line,
        // and the character immediately following the chunk is a space,
        // advance past this space as it acted as a delimiter for word wrapping.
        if (
          logicalStartOfThisChunk + numCodePointsInChunk < codePointsInLogLine.length &&
          currentPosInLogLine < codePointsInLogLine.length && // Redundant if previous is true, but safe
          codePointsInLogLine[currentPosInLogLine]! === " "
        ) {
          currentPosInLogLine++;
        }
      }
    }
  });

  // If the entire logical text was empty, ensure there's one empty visual line.
  if (logicalLines.length === 0 || (logicalLines.length === 1 && logicalLines[0] === "")) {
    if (visualLines.length === 0) {
      visualLines.push("");
      if (!logicalToVisualMap[0]) logicalToVisualMap[0] = [];
      logicalToVisualMap[0].push([0, 0]);
      visualToLogicalMap.push([0, 0]);
    }
  }

  return {
    visualLines,
    logicalToVisualMap,
    visualToLogicalMap,
  };
}

// Calculates the visual cursor position based on a pre-calculated layout.
// This is a lightweight operation.
function calculateVisualCursorFromLayout(
  layout: VisualLayout,
  logicalCursor: [number, number],
): [number, number] {
  const { logicalToVisualMap, visualLines } = layout;
  const [logicalRow, logicalCol] = logicalCursor;

  const segmentsForLogicalLine = logicalToVisualMap[logicalRow]!;

  if (!segmentsForLogicalLine || segmentsForLogicalLine.length === 0) {
    // This can happen for an empty document.
    return [0, 0];
  }

  // Find the segment where the logical column fits.
  // The segments are sorted by startColInLogical.
  let targetSegmentIndex = segmentsForLogicalLine.findIndex(([, startColInLogical], index) => {
    const nextStartColInLogical =
      index + 1 < segmentsForLogicalLine.length ? segmentsForLogicalLine[index + 1]![1] : Infinity;
    return logicalCol >= startColInLogical && logicalCol < nextStartColInLogical;
  });

  // If not found, it means the cursor is at the end of the logical line.
  if (targetSegmentIndex === -1) {
    if (logicalCol === 0) {
      targetSegmentIndex = 0;
    } else {
      targetSegmentIndex = segmentsForLogicalLine.length - 1;
    }
  }

  const [visualRow, startColInLogical] = segmentsForLogicalLine[targetSegmentIndex]!;
  const visualCol = logicalCol - startColInLogical;

  // The visual column should not exceed the length of the visual line.
  const clampedVisualCol = Math.min(visualCol, cpLen(visualLines[visualRow]! ?? ""));

  return [visualRow, clampedVisualCol];
}

// --- Start of reducer logic ---

interface TextBufferState {
  lines: string[];
  cursorRow: number;
  cursorCol: number;
  preferredCol: number | null; // This is visual preferred col
  undoStack: UndoHistoryEntry[];
  redoStack: UndoHistoryEntry[];
  clipboard: string | null;
  selectionAnchor: [number, number] | null;
  viewportWidth: number;
  viewportHeight: number;
  visualLayout: VisualLayout;
}

const historyLimit = 100;

const pushUndo = (currentState: TextBufferState): TextBufferState => {
  const snapshot = {
    lines: [...currentState.lines],
    cursorRow: currentState.cursorRow,
    cursorCol: currentState.cursorCol,
  };
  const newStack = [...currentState.undoStack, snapshot];
  if (newStack.length > historyLimit) {
    newStack.shift();
  }
  return { ...currentState, undoStack: newStack, redoStack: [] };
};

type TextBufferAction =
  | { type: "set_text"; payload: string; pushToUndo?: boolean }
  | { type: "insert"; payload: string }
  | { type: "backspace" }
  | {
      type: "move";
      payload: {
        dir: Direction;
      };
    }
  | {
      type: "set_cursor";
      payload: {
        cursorRow: number;
        cursorCol: number;
        preferredCol: number | null;
      };
    }
  | { type: "delete" }
  | { type: "delete_word_left" }
  | { type: "delete_word_right" }
  | { type: "kill_line_right" }
  | { type: "kill_line_left" }
  | { type: "undo" }
  | { type: "redo" }
  | {
      type: "replace_range";
      payload: {
        startRow: number;
        startCol: number;
        endRow: number;
        endCol: number;
        text: string;
      };
    }
  | { type: "move_to_offset"; payload: { offset: number } }
  | { type: "create_undo_snapshot" }
  | { type: "set_viewport"; payload: { width: number; height: number } };

function textBufferReducerLogic(state: TextBufferState, action: TextBufferAction): TextBufferState {
  const pushUndoLocal = pushUndo;

  const currentLine = (r: number): string => state.lines[r]! ?? "";
  const currentLineLen = (r: number): number => cpLen(currentLine(r));

  switch (action.type) {
    case "set_text": {
      let nextState = state;
      if (action.pushToUndo !== false) {
        nextState = pushUndoLocal(state);
      }
      const newContentLines = action.payload.replace(/\r\n?/g, "\n").split("\n");
      const lines = newContentLines.length === 0 ? [""] : newContentLines;
      const lastNewLineIndex = lines.length - 1;
      return {
        ...nextState,
        lines,
        cursorRow: lastNewLineIndex,
        cursorCol: cpLen(lines[lastNewLineIndex] ?? ""),
        preferredCol: null,
      };
    }

    case "insert": {
      const nextState = pushUndoLocal(state);
      const newLines = [...nextState.lines];
      let newCursorRow = nextState.cursorRow;
      let newCursorCol = nextState.cursorCol;

      const currentLine = (r: number) => newLines[r]! ?? "";

      const str = stripUnsafeCharacters(action.payload.replace(/\r\n/g, "\n").replace(/\r/g, "\n"));
      const parts = str.split("\n");
      const lineContent = currentLine(newCursorRow);
      const before = cpSlice(lineContent, 0, newCursorCol);
      const after = cpSlice(lineContent, newCursorCol);

      if (parts.length > 1) {
        newLines[newCursorRow]! = before + parts[0];
        const remainingParts = parts.slice(1);
        const lastPartOriginal = remainingParts.pop() ?? "";
        newLines.splice(newCursorRow + 1, 0, ...remainingParts);
        newLines.splice(newCursorRow + parts.length - 1, 0, lastPartOriginal + after);
        newCursorRow = newCursorRow + parts.length - 1;
        newCursorCol = cpLen(lastPartOriginal);
      } else {
        newLines[newCursorRow]! = before + parts[0] + after;
        newCursorCol = cpLen(before) + cpLen(parts[0]!);
      }

      return {
        ...nextState,
        lines: newLines,
        cursorRow: newCursorRow,
        cursorCol: newCursorCol,
        preferredCol: null,
      };
    }

    case "backspace": {
      const nextState = pushUndoLocal(state);
      const newLines = [...nextState.lines];
      let newCursorRow = nextState.cursorRow;
      let newCursorCol = nextState.cursorCol;

      const currentLine = (r: number) => newLines[r]! ?? "";

      if (newCursorCol === 0 && newCursorRow === 0) return state;

      if (newCursorCol > 0) {
        const lineContent = currentLine(newCursorRow);
        newLines[newCursorRow]! =
          cpSlice(lineContent, 0, newCursorCol - 1) + cpSlice(lineContent, newCursorCol);
        newCursorCol--;
      } else if (newCursorRow > 0) {
        const prevLineContent = currentLine(newCursorRow - 1);
        const currentLineContentVal = currentLine(newCursorRow);
        const newCol = cpLen(prevLineContent);
        newLines[newCursorRow - 1] = prevLineContent + currentLineContentVal;
        newLines.splice(newCursorRow, 1);
        newCursorRow--;
        newCursorCol = newCol;
      }

      return {
        ...nextState,
        lines: newLines,
        cursorRow: newCursorRow,
        cursorCol: newCursorCol,
        preferredCol: null,
      };
    }

    case "set_viewport": {
      const { width, height } = action.payload;
      if (width === state.viewportWidth && height === state.viewportHeight) {
        return state;
      }
      return {
        ...state,
        viewportWidth: width,
        viewportHeight: height,
      };
    }

    case "move": {
      const { dir } = action.payload;
      const { cursorRow, cursorCol, lines, visualLayout, preferredCol } = state;

      // Visual movements
      if (
        dir === "left" ||
        dir === "right" ||
        dir === "up" ||
        dir === "down" ||
        dir === "home" ||
        dir === "end"
      ) {
        const visualCursor = calculateVisualCursorFromLayout(visualLayout, [cursorRow, cursorCol]);
        const { visualLines, visualToLogicalMap } = visualLayout;

        let newVisualRow = visualCursor[0];
        let newVisualCol = visualCursor[1];
        let newPreferredCol = preferredCol;

        const currentVisLineLen = cpLen(visualLines[newVisualRow]! ?? "");

        switch (dir) {
          case "left":
            newPreferredCol = null;
            if (newVisualCol > 0) {
              newVisualCol--;
            } else if (newVisualRow > 0) {
              newVisualRow--;
              newVisualCol = cpLen(visualLines[newVisualRow]! ?? "");
            }
            break;
          case "right":
            newPreferredCol = null;
            if (newVisualCol < currentVisLineLen) {
              newVisualCol++;
            } else if (newVisualRow < visualLines.length - 1) {
              newVisualRow++;
              newVisualCol = 0;
            }
            break;
          case "up":
            if (newVisualRow > 0) {
              if (newPreferredCol === null) newPreferredCol = newVisualCol;
              newVisualRow--;
              newVisualCol = clamp(newPreferredCol, 0, cpLen(visualLines[newVisualRow]! ?? ""));
            }
            break;
          case "down":
            if (newVisualRow < visualLines.length - 1) {
              if (newPreferredCol === null) newPreferredCol = newVisualCol;
              newVisualRow++;
              newVisualCol = clamp(newPreferredCol, 0, cpLen(visualLines[newVisualRow]! ?? ""));
            }
            break;
          case "home":
            newPreferredCol = null;
            newVisualCol = 0;
            break;
          case "end":
            newPreferredCol = null;
            newVisualCol = currentVisLineLen;
            break;
          default: {
            const exhaustiveCheck: never = dir;
            console.error(`Unknown visual movement direction: ${exhaustiveCheck}`);
            return state;
          }
        }

        if (visualToLogicalMap[newVisualRow]) {
          const [logRow, logStartCol] = visualToLogicalMap[newVisualRow]!;
          return {
            ...state,
            cursorRow: logRow,
            cursorCol: clamp(logStartCol + newVisualCol, 0, cpLen(lines[logRow] ?? "")),
            preferredCol: newPreferredCol,
          };
        }
        return state;
      }

      // Logical movements
      switch (dir) {
        case "wordLeft": {
          if (cursorCol === 0 && cursorRow === 0) return state;

          let newCursorRow = cursorRow;
          let newCursorCol = cursorCol;

          if (cursorCol === 0) {
            newCursorRow--;
            newCursorCol = cpLen(lines[newCursorRow] ?? "");
          } else {
            const lineContent = lines[cursorRow]!;
            const arr = toCodePoints(lineContent);
            let start = cursorCol;
            let onlySpaces = true;
            for (let i = 0; i < start; i++) {
              if (isWordChar(arr[i]!)) {
                onlySpaces = false;
                break;
              }
            }
            if (onlySpaces && start > 0) {
              start--;
            } else {
              while (start > 0 && !isWordChar(arr[start - 1])) start--;
              while (start > 0 && isWordChar(arr[start - 1])) start--;
            }
            newCursorCol = start;
          }
          return {
            ...state,
            cursorRow: newCursorRow,
            cursorCol: newCursorCol,
            preferredCol: null,
          };
        }
        case "wordRight": {
          if (cursorRow === lines.length - 1 && cursorCol === cpLen(lines[cursorRow]! ?? "")) {
            return state;
          }

          let newCursorRow = cursorRow;
          let newCursorCol = cursorCol;
          const lineContent = lines[cursorRow]! ?? "";
          const arr = toCodePoints(lineContent);

          if (cursorCol >= arr.length) {
            newCursorRow++;
            newCursorCol = 0;
          } else {
            let end = cursorCol;
            while (end < arr.length && !isWordChar(arr[end])) end++;
            while (end < arr.length && isWordChar(arr[end])) end++;
            newCursorCol = end;
          }
          return {
            ...state,
            cursorRow: newCursorRow,
            cursorCol: newCursorCol,
            preferredCol: null,
          };
        }
        default:
          return state;
      }
    }

    case "set_cursor": {
      return {
        ...state,
        ...action.payload,
      };
    }

    case "delete": {
      const { cursorRow, cursorCol, lines } = state;
      const lineContent = currentLine(cursorRow);
      if (cursorCol < currentLineLen(cursorRow)) {
        const nextState = pushUndoLocal(state);
        const newLines = [...nextState.lines];
        newLines[cursorRow]! =
          cpSlice(lineContent, 0, cursorCol) + cpSlice(lineContent, cursorCol + 1);
        return {
          ...nextState,
          lines: newLines,
          preferredCol: null,
        };
      } else if (cursorRow < lines.length - 1) {
        const nextState = pushUndoLocal(state);
        const nextLineContent = currentLine(cursorRow + 1);
        const newLines = [...nextState.lines];
        newLines[cursorRow]! = lineContent + nextLineContent;
        newLines.splice(cursorRow + 1, 1);
        return {
          ...nextState,
          lines: newLines,
          preferredCol: null,
        };
      }
      return state;
    }

    case "delete_word_left": {
      const { cursorRow, cursorCol } = state;
      if (cursorCol === 0 && cursorRow === 0) return state;

      const nextState = pushUndoLocal(state);
      const newLines = [...nextState.lines];
      let newCursorRow = cursorRow;
      let newCursorCol = cursorCol;

      if (newCursorCol > 0) {
        const lineContent = currentLine(newCursorRow);
        const prevWordStart = findPrevWordStartInLine(lineContent, newCursorCol);
        const start = prevWordStart === null ? 0 : prevWordStart;
        newLines[newCursorRow]! =
          cpSlice(lineContent, 0, start) + cpSlice(lineContent, newCursorCol);
        newCursorCol = start;
      } else {
        // Act as a backspace
        const prevLineContent = currentLine(cursorRow - 1);
        const currentLineContentVal = currentLine(cursorRow);
        const newCol = cpLen(prevLineContent);
        newLines[cursorRow - 1] = prevLineContent + currentLineContentVal;
        newLines.splice(cursorRow, 1);
        newCursorRow--;
        newCursorCol = newCol;
      }

      return {
        ...nextState,
        lines: newLines,
        cursorRow: newCursorRow,
        cursorCol: newCursorCol,
        preferredCol: null,
      };
    }

    case "delete_word_right": {
      const { cursorRow, cursorCol, lines } = state;
      const lineContent = currentLine(cursorRow);
      const lineLen = cpLen(lineContent);

      if (cursorCol >= lineLen && cursorRow === lines.length - 1) {
        return state;
      }

      const nextState = pushUndoLocal(state);
      const newLines = [...nextState.lines];

      if (cursorCol >= lineLen) {
        // Act as a delete, joining with the next line
        const nextLineContent = currentLine(cursorRow + 1);
        newLines[cursorRow]! = lineContent + nextLineContent;
        newLines.splice(cursorRow + 1, 1);
      } else {
        const nextWordStart = findNextWordStartInLine(lineContent, cursorCol);
        const end = nextWordStart === null ? lineLen : nextWordStart;
        newLines[cursorRow]! = cpSlice(lineContent, 0, cursorCol) + cpSlice(lineContent, end);
      }

      return {
        ...nextState,
        lines: newLines,
        preferredCol: null,
      };
    }

    case "kill_line_right": {
      const { cursorRow, cursorCol, lines } = state;
      const lineContent = currentLine(cursorRow);
      if (cursorCol < currentLineLen(cursorRow)) {
        const nextState = pushUndoLocal(state);
        const newLines = [...nextState.lines];
        newLines[cursorRow]! = cpSlice(lineContent, 0, cursorCol);
        return {
          ...nextState,
          lines: newLines,
        };
      } else if (cursorRow < lines.length - 1) {
        // Act as a delete
        const nextState = pushUndoLocal(state);
        const nextLineContent = currentLine(cursorRow + 1);
        const newLines = [...nextState.lines];
        newLines[cursorRow]! = lineContent + nextLineContent;
        newLines.splice(cursorRow + 1, 1);
        return {
          ...nextState,
          lines: newLines,
          preferredCol: null,
        };
      }
      return state;
    }

    case "kill_line_left": {
      const { cursorRow, cursorCol } = state;
      if (cursorCol > 0) {
        const nextState = pushUndoLocal(state);
        const lineContent = currentLine(cursorRow);
        const newLines = [...nextState.lines];
        newLines[cursorRow]! = cpSlice(lineContent, cursorCol);
        return {
          ...nextState,
          lines: newLines,
          cursorCol: 0,
          preferredCol: null,
        };
      }
      return state;
    }

    case "undo": {
      const stateToRestore = state.undoStack[state.undoStack.length - 1];
      if (!stateToRestore) return state;

      const currentSnapshot = {
        lines: [...state.lines],
        cursorRow: state.cursorRow,
        cursorCol: state.cursorCol,
      };
      return {
        ...state,
        ...stateToRestore,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, currentSnapshot],
      };
    }

    case "redo": {
      const stateToRestore = state.redoStack[state.redoStack.length - 1];
      if (!stateToRestore) return state;

      const currentSnapshot = {
        lines: [...state.lines],
        cursorRow: state.cursorRow,
        cursorCol: state.cursorCol,
      };
      return {
        ...state,
        ...stateToRestore,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, currentSnapshot],
      };
    }

    case "replace_range": {
      const { startRow, startCol, endRow, endCol, text } = action.payload;
      const nextState = pushUndoLocal(state);
      return replaceRangeInternal(nextState, startRow, startCol, endRow, endCol, text);
    }

    case "move_to_offset": {
      const { offset } = action.payload;
      const [newRow, newCol] = offsetToLogicalPos(state.lines.join("\n"), offset);
      return {
        ...state,
        cursorRow: newRow,
        cursorCol: newCol,
        preferredCol: null,
      };
    }

    case "create_undo_snapshot": {
      return pushUndoLocal(state);
    }

    default: {
      const exhaustiveCheck: never = action;
      console.error(`Unknown action encountered: ${exhaustiveCheck}`);
      return state;
    }
  }
}

function textBufferReducer(state: TextBufferState, action: TextBufferAction): TextBufferState {
  const newState = textBufferReducerLogic(state, action);

  if (newState.lines !== state.lines || newState.viewportWidth !== state.viewportWidth) {
    return {
      ...newState,
      visualLayout: calculateLayout(newState.lines, newState.viewportWidth),
    };
  }

  return newState;
}

// --- End of reducer logic ---

export function useTextBuffer({
  initialText = "",
  initialCursorOffset = 0,
  viewport,
  onChange,
  isValidPath,
  shellModeActive = false,
}: UseTextBufferProps): TextBuffer {
  const initialState = useMemo((): TextBufferState => {
    const lines = initialText.split("\n");
    const [initialCursorRow, initialCursorCol] = calculateInitialCursorPosition(
      lines.length === 0 ? [""] : lines,
      initialCursorOffset,
    );
    const visualLayout = calculateLayout(lines.length === 0 ? [""] : lines, viewport.width);
    return {
      lines: lines.length === 0 ? [""] : lines,
      cursorRow: initialCursorRow,
      cursorCol: initialCursorCol,
      preferredCol: null,
      undoStack: [],
      redoStack: [],
      clipboard: null,
      selectionAnchor: null,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      visualLayout,
    };
  }, [initialText, initialCursorOffset, viewport.width, viewport.height]);

  const [state, dispatch] = useReducer(textBufferReducer, initialState);
  const { lines, cursorRow, cursorCol, preferredCol, selectionAnchor, visualLayout } = state;

  const text = useMemo(() => lines.join("\n"), [lines]);

  const visualCursor = useMemo(
    () => calculateVisualCursorFromLayout(visualLayout, [cursorRow, cursorCol]),
    [visualLayout, cursorRow, cursorCol],
  );

  const { visualLines, visualToLogicalMap } = visualLayout;

  const [visualScrollRow, setVisualScrollRow] = useState<number>(0);

  useEffect(() => {
    if (onChange) {
      onChange(text);
    }
  }, [text, onChange]);

  useEffect(() => {
    dispatch({
      type: "set_viewport",
      payload: { width: viewport.width, height: viewport.height },
    });
  }, [viewport.width, viewport.height]);

  // Update visual scroll (vertical)
  useEffect(() => {
    const { height } = viewport;
    const totalVisualLines = visualLines.length;
    const maxScrollStart = Math.max(0, totalVisualLines - height);
    let newVisualScrollRow = visualScrollRow;

    if (visualCursor[0] < visualScrollRow) {
      newVisualScrollRow = visualCursor[0];
    } else if (visualCursor[0] >= visualScrollRow + height) {
      newVisualScrollRow = visualCursor[0] - height + 1;
    }

    // When the number of visual lines shrinks (e.g., after widening the viewport),
    // ensure scroll never starts beyond the last valid start so we can render a full window.
    newVisualScrollRow = clamp(newVisualScrollRow, 0, maxScrollStart);

    if (newVisualScrollRow !== visualScrollRow) {
      setVisualScrollRow(newVisualScrollRow);
    }
  }, [visualCursor, visualScrollRow, viewport, visualLines.length]);

  const insert = useCallback(
    (ch: string, { paste = false }: { paste?: boolean } = {}): void => {
      if (/[\n\r]/.test(ch)) {
        dispatch({ type: "insert", payload: ch });
        return;
      }

      const minLengthToInferAsDragDrop = 3;
      if (ch.length >= minLengthToInferAsDragDrop && !shellModeActive && paste) {
        let potentialPath = ch.trim();
        const quoteMatch = potentialPath.match(/^'(.*)'$/);
        if (quoteMatch) {
          potentialPath = quoteMatch[1]!;
        }

        potentialPath = potentialPath.trim();
        if (isValidPath(potentialPath)) {
          ch = `@${potentialPath} `;
        }
      }

      let currentText = "";
      for (const char of toCodePoints(ch)) {
        if (char.codePointAt(0) === 127) {
          if (currentText.length > 0) {
            dispatch({ type: "insert", payload: currentText });
            currentText = "";
          }
          dispatch({ type: "backspace" });
        } else {
          currentText += char;
        }
      }
      if (currentText.length > 0) {
        dispatch({ type: "insert", payload: currentText });
      }
    },
    [isValidPath, shellModeActive],
  );

  const newline = useCallback((): void => {
    dispatch({ type: "insert", payload: "\n" });
  }, []);

  const backspace = useCallback((): void => {
    dispatch({ type: "backspace" });
  }, []);

  const del = useCallback((): void => {
    dispatch({ type: "delete" });
  }, []);

  const move = useCallback(
    (dir: Direction): void => {
      dispatch({ type: "move", payload: { dir } });
    },
    [dispatch],
  );

  const undo = useCallback((): void => {
    dispatch({ type: "undo" });
  }, []);

  const redo = useCallback((): void => {
    dispatch({ type: "redo" });
  }, []);

  const setText = useCallback((newText: string): void => {
    dispatch({ type: "set_text", payload: newText });
  }, []);

  const deleteWordLeft = useCallback((): void => {
    dispatch({ type: "delete_word_left" });
  }, []);

  const deleteWordRight = useCallback((): void => {
    dispatch({ type: "delete_word_right" });
  }, []);

  const killLineRight = useCallback((): void => {
    dispatch({ type: "kill_line_right" });
  }, []);

  const killLineLeft = useCallback((): void => {
    dispatch({ type: "kill_line_left" });
  }, []);

  const handleInput = useCallback(
    (key: {
      name: string;
      ctrl: boolean;
      meta: boolean;
      shift: boolean;
      paste: boolean;
      sequence: string;
    }): void => {
      const { sequence: input } = key;

      if (key.paste) {
        // Do not do any other processing on pastes so ensure we handle them
        // before all other cases.
        insert(input, { paste: key.paste });
        return;
      }

      if (
        key.name === "return" ||
        input === "\r" ||
        input === "\n" ||
        input === "\\\r" // VSCode terminal represents shift + enter this way
      )
        newline();
      else if (key.name === "left" && !key.meta && !key.ctrl) move("left");
      else if (key.ctrl && key.name === "b") move("left");
      else if (key.name === "right" && !key.meta && !key.ctrl) move("right");
      else if (key.ctrl && key.name === "f") move("right");
      else if (key.name === "up") move("up");
      else if (key.name === "down") move("down");
      else if ((key.ctrl || key.meta) && key.name === "left") move("wordLeft");
      else if (key.meta && key.name === "b") move("wordLeft");
      else if ((key.ctrl || key.meta) && key.name === "right") move("wordRight");
      else if (key.meta && key.name === "f") move("wordRight");
      else if (key.name === "home") move("home");
      else if (key.ctrl && key.name === "a") move("home");
      else if (key.name === "end") move("end");
      else if (key.ctrl && key.name === "e") move("end");
      else if (key.ctrl && key.name === "w") deleteWordLeft();
      else if ((key.meta || key.ctrl) && (key.name === "backspace" || input === "\x7f"))
        deleteWordLeft();
      else if ((key.meta || key.ctrl) && key.name === "delete") deleteWordRight();
      else if (key.name === "backspace" || input === "\x7f" || (key.ctrl && key.name === "h"))
        backspace();
      else if (key.name === "delete" || (key.ctrl && key.name === "d")) del();
      else if (key.ctrl && !key.shift && key.name === "z") undo();
      else if (key.ctrl && key.shift && key.name === "z") redo();
      else if (input && !key.ctrl && !key.meta) {
        insert(input, { paste: key.paste });
      }
    },
    [newline, move, deleteWordLeft, deleteWordRight, backspace, del, insert, undo, redo],
  );

  const renderedVisualLines = useMemo(
    () => visualLines.slice(visualScrollRow, visualScrollRow + viewport.height),
    [visualLines, visualScrollRow, viewport.height],
  );

  const returnValue: TextBuffer = useMemo(
    () => ({
      lines,
      text,
      cursor: [cursorRow, cursorCol],
      preferredCol,
      selectionAnchor,

      allVisualLines: visualLines,
      viewportVisualLines: renderedVisualLines,
      visualCursor,
      visualScrollRow,
      visualToLogicalMap,

      setText,
      insert,
      newline,
      backspace,
      del,
      move,
      undo,
      redo,
      deleteWordLeft,
      deleteWordRight,

      killLineRight,
      killLineLeft,
      handleInput,
    }),
    [
      lines,
      text,
      cursorRow,
      cursorCol,
      preferredCol,
      selectionAnchor,
      visualLines,
      renderedVisualLines,
      visualCursor,
      visualScrollRow,
      setText,
      insert,
      newline,
      backspace,
      del,
      move,
      undo,
      redo,
      deleteWordLeft,
      deleteWordRight,
      killLineRight,
      killLineLeft,
      handleInput,
      visualToLogicalMap,
    ],
  );
  return returnValue;
}

export interface TextBuffer {
  // State
  lines: string[]; // Logical lines
  text: string;
  cursor: [number, number]; // Logical cursor [row, col]
  /**
   * When the user moves the caret vertically we try to keep their original
   * horizontal column even when passing through shorter lines.  We remember
   * that *preferred* column in this field while the user is still travelling
   * vertically.  Any explicit horizontal movement resets the preference.
   */
  preferredCol: number | null; // Preferred visual column
  selectionAnchor: [number, number] | null; // Logical selection anchor

  // Visual state (handles wrapping)
  allVisualLines: string[]; // All visual lines for the current text and viewport width.
  viewportVisualLines: string[]; // The subset of visual lines to be rendered based on visualScrollRow and viewport.height
  visualCursor: [number, number]; // Visual cursor [row, col] relative to the start of all visualLines
  visualScrollRow: number; // Scroll position for visual lines (index of the first visible visual line)
  /**
   * For each visual line (by absolute index in allVisualLines) provides a tuple
   * [logicalLineIndex, startColInLogical] that maps where that visual line
   * begins within the logical buffer. Indices are code-point based.
   */
  visualToLogicalMap: Array<[number, number]>;

  // Actions

  /**
   * Replaces the entire buffer content with the provided text.
   * The operation is undoable.
   */
  setText: (text: string) => void;
  /**
   * Insert a single character or string without newlines.
   */
  insert: (ch: string, opts?: { paste?: boolean }) => void;
  newline: () => void;
  backspace: () => void;
  del: () => void;
  move: (dir: Direction) => void;
  undo: () => void;
  redo: () => void;
  /**
   * Delete the word to the *left* of the caret, mirroring common
   * Ctrl/Alt+Backspace behaviour in editors & terminals. Both the adjacent
   * whitespace *and* the word characters immediately preceding the caret are
   * removed.  If the caret is already at column‑0 this becomes a no-op.
   */
  deleteWordLeft: () => void;
  /**
   * Delete the word to the *right* of the caret, akin to many editors'
   * Ctrl/Alt+Delete shortcut.  Removes any whitespace/punctuation that
   * follows the caret and the next contiguous run of word characters.
   */
  deleteWordRight: () => void;

  /**
   * Deletes text from the cursor to the end of the current line.
   */
  killLineRight: () => void;
  /**
   * Deletes text from the start of the current line to the cursor.
   */
  killLineLeft: () => void;
  /**
   * High level "handleInput" – receives what Ink gives us.
   */
  handleInput: (key: {
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
    paste: boolean;
    sequence: string;
  }) => void;
}
