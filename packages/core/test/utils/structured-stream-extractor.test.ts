import { expect, test } from "bun:test";
import { readableStreamToArray, stringToAgentResponseStream } from "@aigne/core";
import { ExtractMetadataTransform } from "@aigne/core/utils/structured-stream-extractor.js";

test("ExtractMetadataTransform should extract metadata from structured stream", async () => {
  const stream = stringToAgentResponseStream(`\
Hello, How can I help you today?<metadata>
{
  "foo": "bar",
  "baz": 123
}
</metadata>`).pipeThrough(
    new ExtractMetadataTransform({
      start: "<metadata>",
      end: "</metadata>",
      parse: JSON.parse,
    }),
  );

  expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
});
