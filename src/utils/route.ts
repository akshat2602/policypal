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

    // Construct the prompt
    let qwen_prompt = `\
    You are an assistant to an assistant, your job is to shorten the prompt for another LLM that only takes in 200-250 tokens as its input. MAKE SURE you go through the citations and pull out important information that needs to be fed to the next assistant and include that. It is important to make sure that the next assistant has all the information it needs to generate a response.
    Here's the prompt you need to shorten:
------ Prompt Starts ------

    You are assisting patients in evaluating their insurance claims with empathy and precision. You have access to detailed documents such as the user's insurance card, confirmation of coverage, a network directory, an insurance summary flyer, and a markdown file detailing the denial. 
Your primary goals are: 1) to assess whether a denied insurance claim is justified based on the documents provided, and if not, draft a denial appeal mail for the user to send; and 2) check processed claims for any pending patient balances, verify their accuracy, and inform the user of any discrepancies. Always approach interactions with clarity, understanding, and a focus on user support. 
Double-check all factual details from the documents provided before forming conclusions, and explain findings in simple, compassionate terms to ensure the user feels supported and confident in next steps.
    Answer the user's query with citation in mind.
----- Citation Starts -----
${results.entries
    .slice(0, 2)
    .map((entry) => entry.content)
    .join("\n")}
----- Citation Ends -----

User's question is: "${question}". Be assurative in your answer and give answer that is not more than 3 paragraphs.
------ Prompt Ends ------

    Generate the shortened prompt for the LLM that only takes in 200-250 tokens as its input.
`;

    qwen_prompt = `\
    "**Shortened Prompt:**

You are assisting patients with evaluating their insurance claims. You have access to documents like the user's insurance card, confirmation of coverage, network directory, summary flyer, and denial details. Your goals are:
1. Assess if a denied claim is justified based on provided documents.
2. Draft a denial appeal mail for users.
3. Check processed claims for pending patient balances and verify their accuracy.

Always be clear, empathetic, and focused on user support. Double-check factual details before forming conclusions and explain findings simply to ensure the user feels supported.

**Citation:**
- **Overall Plan Maximum:** No overall maximum dollar limit
- **Plan Deductible:** $0 per member per plan year
- **Out-of-Pocket Maximum:** $7,350 per member per plan year
- **Coinsurance:** 0% of Allowed Amount for prescription drugs and preventive care services (10% after deductible)
- **Prescription Drugs:** $10 Copay for generic drugs
- **Preventive Care Services:** Covered in full

**Additional Notes:**
- Prescription drugs include mail order options and a 90-day supply at 2.5x the retail Copay.
- Preventive care services include annual physicals, GYN exams, screenings, and immunizations.

**Plan Resources:**
- Manage benefits, submit claims, download ID cards: [uhcsr.com/myaccount](http://www.uhcsr.com/myaccount)
- Find an in-network provider: [UHC Options PPO](http://www.uhcsr.com/lookupredirect.aspx?delsys=01)
- Prescription drug provider: [Optum Rx](https://www.optumrx.com/oe_rxexternal/pharmacy-locator)

**Contact Information:**
- **Date:** December 07, 2024
- **Insurance Company:** UnitedHealthcare Insurance Company of New York
- **Policy Number:** 2024-203426-41
- **Type of Coverage Purchased:** Student Plan - Injury & Sickness

**User's Question:**
Give a point for rebuttal for this insurance claim denial. Be assurative and concise.

**Response Guidelines:**
- Provide a clear, compelling point to refute the denial.
- Use simple language.
- Ensure the user feels supported and confident in their next steps."

    `;
    // Load LLM model
    const qwen_llama = await client.llm.getOrLoad("qwen2.5-coder-7b-instruct");
    const qwen_prompt_prediction = await qwen_llama.respond(
        [
            {
                role: "user",
                content: qwen_prompt,
            },
        ],
        {
            contextOverflowPolicy: "stopAtLimit",
            maxPredictedTokens: 750,
            temperature: 0.3,
        }
    );
    console.log("prompt", qwen_prompt_prediction.content);
    const actual_llama = await client.llm.getOrLoad("llama-3.2-3b-qnn");

    // Streaming response function
    async function* streamResponse(qwen_prompt_prediction: string) {
        try {
            console.log("\nGenerating streaming response...");

            const prediction = actual_llama.respond(
                [
                    {
                        role: "user",
                        content: qwen_prompt_prediction,
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
    return streamResponse(qwen_prompt_prediction.content);
}
