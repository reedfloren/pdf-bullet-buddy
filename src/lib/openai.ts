import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const analyzePDF = async (pdfText: string) => {
  try {
    const thread = await openai.beta.threads.create();
    
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Please analyze this PDF content and create compelling sales copy bullet points: ${pdfText}`,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: import.meta.env.VITE_ASSISTANT_ID,
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      if (runStatus.status === "failed") {
        throw new Error("Analysis failed");
      }
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    return messages.data[0].content[0].text.value;
  } catch (error) {
    throw new Error("Failed to analyze PDF");
  }
};