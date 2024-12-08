import { LMStudioClient, FileHandle } from "@lmstudio/sdk";
import { invoke } from "@tauri-apps/api/core";
import { Buffer } from "buffer";

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
            const documentBuffer = Buffer.from(content);
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
): Promise<AsyncGenerator<string>> {
    const client = new LMStudioClient({
        baseUrl: "ws://10.253.213.24:1234",
    });

    // Load embedding model
    const nomic = await client.embedding.getOrLoad(
        "text-embedding-nomic-embed-text-v1.5"
    );

    // Retrieve relevant content
    let results;
    console.log(documentHandles);
    results = await client.retrieval.retrieve(question, documentHandles, {
        embeddingModel: nomic,
    });

    let og_prompt = `\
    You are assisting patients in evaluating their insurance claims with empathy and precision. You have access to detailed documents such as the user's insurance card, confirmation of coverage, a network directory, an insurance summary flyer, and a markdown file detailing the denial. 
Your primary goals are: 1) to assess whether a denied insurance claim is justified based on the documents provided, and if not, draft a denial appeal mail for the user to send; and 2) check processed claims for any pending patient balances, verify their accuracy, and inform the user of any discrepancies. Always approach interactions with clarity, understanding, and a focus on user support. 
Double-check all factual details from the documents provided before forming conclusions, and explain findings in simple, compassionate terms to ensure the user feels supported and confident in next steps.
    `;
    // Construct the prompt
    const prompt = `\
    You are assisting patients in evaluating their insurance claims with empathy and precision. You have access to detailed documents such as the user's insurance card, confirmation of coverage, a network directory, an insurance summary flyer, and a markdown file detailing the denial. 
Your primary goals are: 1) to assess whether a denied insurance claim is justified based on the documents provided, and if not, draft a denial appeal mail for the user to send; and 2) check processed claims for any pending patient balances, verify their accuracy, and inform the user of any discrepancies. Always approach interactions with clarity, understanding, and a focus on user support. 
Double-check all factual details from the documents provided before forming conclusions, and explain findings in simple, compassionate terms to ensure the user feels supported and confident in next steps.
    Answer the user's query with citation in mind.
----- Citation Starts -----
${results.entries
    .slice(0, 3)
    .map((entry) => entry.content)
    .join("\n")}
----- Citation Ends -----

User's question is: "${question}". Be assurative in your answer and give answer that is not more than 3 paragraphs.
`;

    console.log("prompt", prompt);

    // Load LLM model
    const llama = await client.llm.getOrLoad("qwen2.5-coder-7b-instruct");

    // Streaming response function
    async function* streamResponse(prompt: string) {
        try {
            console.log("\nGenerating streaming response...");

            const prediction = llama.respond(
                [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                {
                    contextOverflowPolicy: "stopAtLimit",
                    maxPredictedTokens: 750,
                    temperature: 0.3,
                }
            );

            for await (const chunk of prediction) {
                yield chunk.content;
            }
        } catch (error) {
            console.error("Error generating response:", error);
            throw error;
        }
    }

    // Return the stream generator
    return streamResponse(prompt);
}
