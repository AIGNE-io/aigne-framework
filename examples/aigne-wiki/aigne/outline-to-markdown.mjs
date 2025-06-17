export default async function outlineToMarkdown({ title, sections }) {
  const renderSection = (section) => {
    return `\
## ${section.title}

${section.content}

${"```"}ts file="${section.codePath}" region="${section.codeRegion}"
${section.code}
${"```"}
`;
  };

  return {
    markdown: `\
# ${title}

${sections.map((section) => renderSection(section)).join("\n")}
`,
  };
}

outlineToMarkdown.input_schema = {
  type: "object",
  properties: {
    title: {
      type: "string",
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
          },
          content: {
            type: "string",
          },
          code: {
            type: "string",
          },
          codePath: {
            type: "string",
          },
          codeRegion: {
            type: "string",
          },
        },
        required: ["title", "content", "code", "codePath", "codeRegion"],
      },
    },
  },
  required: ["title", "sections"],
};

outlineToMarkdown.output_schema = {
  type: "object",
  properties: {
    markdown: {
      type: "string",
    },
  },
  required: ["markdown"],
};
