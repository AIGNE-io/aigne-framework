import { parse } from "yaml";

export const STRUCTURED_STREAM_INSTRUCTIONS = {
  instructions: `\
<output-rules>
- First, use <metadata></metadata> tags to output metadata. The metadata should be output in YAML format as structured data, and must conform to the format defined in <metadata-schema></metadata-schema>.
- At the end of the response output the regular response content.
</output-rules>

<metadata-schema>
{{outputJsonSchema}}
</metadata-schema>

<output-example>
<metadata>
foo: bar
baz: 123
</metadata>
Here is the regular response content
</output-example>
`,
  metadataStart: "<metadata>",
  metadataEnd: "</metadata>",
  parse,
};
