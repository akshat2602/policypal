import { LMStudioClient, FileHandle } from "@lmstudio/sdk";
import { invoke } from "@tauri-apps/api/core";


export async function EMBED_FILES(
    documentPaths: string[]
): Promise<FileHandle[]> {
    const client = new LMStudioClient({
        baseUrl: "ws://10.253.213.24:1234",
    });
    console.log("Uploading files...");
    const documentHandles: FileHandle[] = [];

    for (const documentPath of documentPaths) {
        try {
            // Read file content
            const content = await invoke<string>("read_file_content", {
                path: documentPath,
            });
            console.log("reading file content", content);
            // Convert content to buffer
            const documentBuffer = new TextEncoder().encode(content);
            console.log("created buffer", documentBuffer);
            // Upload the document as a temp file
            const documentHandle = await client.files.uploadTempFile(
                documentPath,
                documentBuffer
            );
            console.log("uploaded file", documentHandle);
            documentHandles.push(documentHandle);
        } catch (error) {
            console.error(`Error processing file ${documentPath}:`, error);
        }
    }

    return documentHandles;
}

export async function POST(
    question: string,
    documentHandles: FileHandle[]
): Promise<string> {
    const client = new LMStudioClient({
        baseUrl: "ws://10.253.213.24:1234",
    });
    // Load embedding model
    const nomic = await client.embedding.getOrLoad(
        "text-embedding-nomic-embed-text-v1.5"
    );

    // Retrieve relevant content
    let results;

    results = await client.retrieval.retrieve(question, documentHandles, {
        embeddingModel: nomic,
    });

    // Construct the prompt
    const prompt = `\
Answer the user's query with the following citation:

----- Citation -----
${results.entries[0].content}
----- End of Citation -----

User's question is ${question}, be assurative in your answer annd give specific answer`;

    // Load LLM model
    const llama = await client.llm.getOrLoad("llama-3.2-3b-qnn");
    const prediction = llama.respond([{ role: "user", content: prompt }]);

    let answer = "";
    for await (const { content } of prediction) {
        answer += content;
    }

    return answer;
}
