import { expect, test } from "bun:test";
import { AFS } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";

test("AFS's skills should have correct tag", async () => {
  const skills = await getAFSSkills(new AFS());
  expect(skills.every((skill) => skill.tag === "AFS")).toBe(true);
});
