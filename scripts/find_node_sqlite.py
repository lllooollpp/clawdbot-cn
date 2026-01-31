import argparse
import os
from pathlib import Path

TEXT_EXTS = {
    ".js",
    ".cjs",
    ".mjs",
    ".ts",
    ".tsx",
    ".jsx",
    ".json",
    ".md",
    ".txt",
}


def is_text_file(path: Path) -> bool:
    return path.suffix.lower() in TEXT_EXTS


def iter_files(root: Path, include_node_modules: bool, include_out: bool):
    for dirpath, dirnames, filenames in os.walk(root):
        dirpath_lower = dirpath.replace("\\", "/")
        if not include_node_modules and "/node_modules" in dirpath_lower:
            dirnames[:] = []
            continue
        if not include_out and "/out/" in f"{dirpath_lower}/":
            dirnames[:] = []
            continue
        for name in filenames:
            path = Path(dirpath) / name
            if is_text_file(path):
                yield path


def find_matches(root: Path, needle: str, include_node_modules: bool, include_out: bool):
    for path in iter_files(root, include_node_modules, include_out):
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if needle in content:
            for idx, line in enumerate(content.splitlines(), start=1):
                if needle in line:
                    yield path, idx, line.strip()


def main():
    parser = argparse.ArgumentParser(description="Find references to node:sqlite.")
    parser.add_argument(
        "--root",
        default=str(Path(__file__).resolve().parents[1]),
        help="Root directory to search (default: repo root)",
    )
    parser.add_argument(
        "--needle",
        default="node:sqlite",
        help="Text to search for (default: node:sqlite)",
    )
    parser.add_argument(
        "--include-node-modules",
        action="store_true",
        help="Include node_modules in the search",
    )
    parser.add_argument(
        "--include-out",
        action="store_true",
        help="Include out/ build output in the search",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    matches = list(find_matches(root, args.needle, args.include_node_modules, args.include_out))

    if not matches:
        print("No matches found.")
        return

    for path, line_no, line in matches:
        rel_path = path.relative_to(root)
        print(f"{rel_path}:{line_no}: {line}")


if __name__ == "__main__":
    main()
