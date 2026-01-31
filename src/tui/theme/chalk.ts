import chalk, { Chalk } from "chalk";

const hasForceColor =
  typeof process.env.FORCE_COLOR === "string" &&
  process.env.FORCE_COLOR.trim().length > 0 &&
  process.env.FORCE_COLOR.trim() !== "0";

const colorLevel = process.env.NO_COLOR && !hasForceColor ? 0 : (chalk.level ?? 3);

export const baseChalk = new Chalk({ level: colorLevel });
