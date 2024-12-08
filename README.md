# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

-   [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

# TODO:

Input question
make chat ui
where left part comes from lm studio
right part comes from input box
input box text goes to POST function in route.ts, which then iterates over all the pdf files that the user has pointed to, read them and then upload them to the lm stduio temp file context,
once I am done, I send the most relevant docs and the question to the LLM with god system prompt and then result.
