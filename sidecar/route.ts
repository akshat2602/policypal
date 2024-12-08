import { LMStudioClient } from "@lmstudio/sdk";
import { readFile } from "fs/promises";
import { convertPDFWithDynamicPath } from "./process-bad-pdf";
import { exit } from "process";

export async function POST(
    question: string,
    documentPath: string
): Promise<string> {
    const client = new LMStudioClient({
        baseUrl: "ws://10.253.212.11:1234",
    });

    // Read the document
    const documentBuffer = await readFile(documentPath);

    // Upload the document as a temp file
    const documentHandle = await client.files.uploadTempFile(
        documentPath,
        documentBuffer
    );

    // Load embedding model
    const nomic = await client.embedding.getOrLoad(
        "text-embedding-nomic-embed-text-v1.5"
    );

    // Retrieve relevant content
    let results;
    try {
        results = await client.retrieval.retrieve(question, [documentHandle], {
            embeddingModel: nomic,
        });
    } catch (retrieveError) {
        console.error("Error in retrieval:", retrieveError);
        const documentHandle = await client.files.uploadTempFile(
            documentPath,
            Buffer.from(await convertPDFWithDynamicPath(documentPath), "utf-8")
        );
        try {
            results = await client.retrieval.retrieve(
                question,
                [documentHandle],
                {
                    embeddingModel: nomic,
                }
            );
        } catch (retrieveError) {
            // NAHI HORA HAI
            exit(1);
        }
    }

    // Construct the prompt
    const prompt = `\
Answer the user's query with the following citation:

----- Citation -----
${results.entries[0].content}
----- End of Citation -----

User's question is ${question}, be assurative in your answer annd give specific answer`;

    // Load LLM model
    const llama = await client.llm.getOrLoad("qwen2.5-7b-instruct");
    const prediction = llama.respond([{ role: "user", content: prompt }]);

    let answer = "";
    for await (const { content } of prediction) {
        answer += content;
    }

    return answer;
}
