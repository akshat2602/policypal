import { NextRequest, NextResponse } from 'next/server';
import { LMStudioClient } from "@lmstudio/sdk";
import { readFile } from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const client = new LMStudioClient({baseUrl: 'ws://10.253.213.24:1234'});

    // Read the document
    // const documentPath = "doc/omkar-doc.md";
    // const documentBuffer = await readFile(documentPath);

    // // Upload the document as a temp file
    // const documentHandle = await client.files.uploadTempFile("doc/omkar-doc.md", documentBuffer);

    const documentPaths = ["doc/full_insurance_aug24.md"];
    const documentBuffers = await Promise.all(documentPaths.map((path) => readFile(path)));

    // Upload the documents as temp files
    const documentHandles = [];
    for (let i = 0; i < documentPaths.length; i++) {
        const handle = await client.files.uploadTempFile(documentPaths[i], documentBuffers[i]);
        documentHandles.push(handle);
    }

    // Load embedding model
    const nomic = await client.embedding.getOrLoad("text-embedding-nomic-embed-text-v1.5");


    const results = await client.retrieval.retrieve(question, documentHandles, {
      embeddingModel: nomic,
    });

    // Construct the prompt
    const prompt = `\
    You are assisting a user in challenging a denied insurance claim. You have access to details of the user's insurance such as confirmation of coverage, network directory, the user's insurance card. and a summary flyer of the insurance. You have access to a markdown file detailing the denial, including a ‘remarks’ section that explains the insurer’s reasoning. Your goal is to carefully review the ‘remarks’ section and other factual details from the provided documents and produce a persuasive, fact-based counter-message.

    Instructions:

    Use the Remarks Section: Examine the remarks in the denied insurance markdown file. Identify the insurer’s stated reason(s) for denial and any conditions, policies, or factual details cited.

    Formulate a Counterargument: Construct a carefully reasoned message that directly addresses the insurer’s denial rationale.

    Highlight any inconsistencies, oversights, or ambiguities in the insurer’s stated reason.
    Present evidence or facts, drawn from the remarks and any relevant policy details, that challenge the denial basis.
    Emphasize compliance with policy terms, relevant medical or factual clarifications, and any external precedents or guidelines that support overturning the denial.
    Maintain a Professional and Persuasive Tone: The message should be respectful, clear, and authoritative. It should demonstrate a thorough understanding of the insurer’s position, but assert why a review or reversal of the decision is warranted.

    Cite Relevant Details: Where possible, refer to the specific sections or language from the insurer’s remarks, policy documents, or previous communications. Show that you have done your homework and are using their own guidelines or statements to support your request.

    Goal:
    Produce a final message that can be presented to the insurer or relevant decision-maker, encouraging them to reconsider the denial. The message should feel well-informed, confident, and grounded in the facts gleaned from the remarks section and any related data
    Answer the user's query with the following citation:

----- Citation -----
${results.entries[0].content}
----- End of Citation -----

User's question is ${question}`;

    // Load LLM model
    const llama = await client.llm.getOrLoad("qwen2.5-coder-14b-instruct");
    const prediction = llama.respond([{ role: "user", content: prompt }]);

    let answer = "";
    for await (const { content } of prediction) {
      answer += content;
    }

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Error in ask route:", error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
