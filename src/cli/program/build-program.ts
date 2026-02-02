import { Command } from "commander";
import { createProgramContext } from "./context.js";
import { registerProgramCommands } from "./command-registry.js";
import { configureProgramHelp } from "./help.js";
import { registerPreActionHooks } from "./preaction.js";

export function buildProgram() {
  const program = new Command();
  const ctx = createProgramContext();
  const argv = process.argv;

  configureProgramHelp(program, ctx);
  registerPreActionHooks(program, ctx.programVersion);

  registerProgramCommands(program, ctx, argv);

  if (argv.includes("--completion-list")) {
    const listCommands = (cmd: Command, prefix = "") => {
      let names: string[] = [];
      for (const c of cmd.commands) {
        const name = prefix ? `${prefix} ${c.name()}` : c.name();
        names.push(name);
        names = names.concat(listCommands(c, name));
      }
      return names;
    };
    console.log(listCommands(program).join("\n"));
    process.exit(0);
  }

  return program;
}
