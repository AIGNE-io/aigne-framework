// Agent function: upload pageTemplate to Pages Kit
export default async function Agent({ pageTemplate, locale, projectId }) {
  // Build request headers
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  // Build request body
  const raw = JSON.stringify({
    projectId,
    lang: locale,
    pageYaml: pageTemplate,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    // Send request to Pages Kit interface
    const response = await fetch(
      `${process.env.PAGES_KIT_API_URL}/api/sdk/upload-page`,
      requestOptions,
    );
    try {
      const data = await response.json();
      return { uploadPageResult: data };
    } catch {
      const text = await response.text();
      return { uploadPageResult: text };
    }
  } catch (error) {
    return { error: error.message };
  }
}

Agent.output_schema = {
  type: "object",
  properties: {
    uploadPageResult: {},
    error: { type: "string" },
  },
};

Agent.description = "Upload pageTemplate to Pages Kit and return the API response";
