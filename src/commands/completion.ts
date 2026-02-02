import process from "node:process";
import type { RuntimeEnv } from "../runtime.js";

export async function completionCommand(shell: string | undefined, runtime: RuntimeEnv) {
  const target = shell || (process.env.SHELL?.includes("zsh") ? "zsh" : "bash");
  
  if (target === "zsh") {
    runtime.log(`# Zsh completion for clawdbot
if [[ ! -o interactive ]]; then
    return
fi

compdef _clawdbot_completion clawdbot

function _clawdbot_completion {
  local -a completions
  local -a commands
  completions=(\${(f)"$(clawdbot --completion-list)"})
  _values 'clawdbot' $completions
}
`);
  } else {
    runtime.log(`# Bash completion for clawdbot
_clawdbot_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    opts="$(clawdbot --completion-list)"

    if [[ \${cur} == * ]] ; then
        COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
        return 0
    fi
}
complete -F _clawdbot_completion clawdbot
`);
  }
}
