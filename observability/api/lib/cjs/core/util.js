"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlocklet = void 0;
const isBlocklet = !!process.env.BLOCKLET_APP_DIR && !!process.env.BLOCKLET_PORT;
exports.isBlocklet = isBlocklet;
