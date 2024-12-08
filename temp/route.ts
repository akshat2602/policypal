import { NextRequest, NextResponse } from 'next/server';
import { LMStudioClient } from "@lmstudio/sdk";
import { readFile } from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const client = new LMStudioClient({baseUrl: 'ws://10.253.212.11:1234'});

    // Read the document
    const documentPath = "doc/omkar-doc.md";
    const documentBuffer = await readFile(documentPath);

    // Upload the document as a temp file
    const documentHandle = await client.files.uploadTempFile("doc/omkar-doc.md", documentBuffer);

    // Load embedding model
    const nomic = await client.embedding.getOrLoad("text-embedding-nomic-embed-text-v1.5");

    // Retrieve relevant content
    const results = await client.retrieval.retrieve(question, [documentHandle], {
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
    const llama = await client.llm.getOrLoad("qwen2.5-7b-instruct");
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
