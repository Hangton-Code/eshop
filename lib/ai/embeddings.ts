export async function getEmbeddings(text: string) {
  const response = await fetch(
    "https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ALIYUN_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-v4",
        input: text,
        dimension: "1536",
        encoding_format: "float",
      }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to get embeddings");
  }

  const data = await response.json();

  return data.data[0].embedding;
}
