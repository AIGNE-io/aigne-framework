import { parse } from "yaml";

export const STRUCTURED_STREAM_INSTRUCTIONS = {
  instructions: `\
<output-rules>
- First, output the regular response content.
- At the end of the response, use <metadata></metadata> tags to output metadata. The metadata should be output in YAML format as structured data, and must conform to the format defined in <metadata-schema></metadata-schema>.
</output-rules>

<metadata-schema>
{{outputJsonSchema}}
</metadata-schema>

<output-example>
Here is the regular response content
<metadata>
foo: bar
baz: 123
</metadata>
</output-example>
`,
  metadataStart: "<metadata>",
  metadataEnd: "</metadata>",
  parse,
};
