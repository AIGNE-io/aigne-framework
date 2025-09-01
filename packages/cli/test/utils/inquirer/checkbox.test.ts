import { describe, expect, it } from "bun:test";
import checkbox from "@aigne/cli/utils/inquirer/checkbox.js";
import { Separator, ValidationError } from "@inquirer/core";
import { render } from "@inquirer/testing";

const numberedChoices = [
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 },
  { value: 5 },
  { value: 6 },
  { value: 7 },
  { value: 8 },
  { value: 9 },
  { value: 10 },
  { value: 11 },
  { value: 12 },
];

describe("checkbox prompt", () => {
  it("use arrow keys to select an option", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7
      (Use arrow keys to reveal more choices)"
    `);

    events.keypress("down");
    events.keypress("space");
    events.keypress("down");
    events.keypress("space");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number
       ◯ 1
       ◉ 2
      ❯◉ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([2, 3]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a number 2, 3"');
  });

  it("works with string choices", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: ["Option A", "Option B", "Option C"],
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ Option A
       ◯ Option B
       ◯ Option C"
    `);

    events.keypress("down");
    events.keypress("space");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number
       ◯ Option A
      ❯◉ Option B
       ◯ Option C"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual(["Option B"]);
    expect(getScreen()).toMatchInlineSnapshot(`"✔ Select a number Option B"`);
  });

  it("does not scroll up beyond first item when not looping", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
      loop: false,
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7
      (Use arrow keys to reveal more choices)"
    `);

    events.keypress("up");
    events.keypress("space");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number
      ❯◉ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([1]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a number 1"');
  });

  it("does not scroll up beyond first selectable item when not looping", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: [new Separator(), ...numberedChoices],
      loop: false,
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
       ──────────────
      ❯◯ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
      (Use arrow keys to reveal more choices)"
    `);

    events.keypress("up");
    events.keypress("space");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number
       ──────────────
      ❯◉ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([1]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a number 1"');
  });

  it("does not scroll down beyond last option when not looping", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
      loop: false,
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7
      (Use arrow keys to reveal more choices)"
    `);

    numberedChoices.forEach(() => events.keypress("down"));
    events.keypress("down");
    events.keypress("space");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number
       ◯ 6
       ◯ 7
       ◯ 8
       ◯ 9
       ◯ 10
       ◯ 11
      ❯◉ 12"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([12]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a number 12"');
  });

  it("does not scroll down beyond last selectable option when not looping", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: [...numberedChoices, new Separator()],
      loop: false,
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7
      (Use arrow keys to reveal more choices)"
    `);

    numberedChoices.forEach(() => events.keypress("down"));
    events.keypress("down");
    events.keypress("space");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number
       ◯ 7
       ◯ 8
       ◯ 9
       ◯ 10
       ◯ 11
      ❯◉ 12
       ──────────────"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([12]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a number 12"');
  });

  it("use number key to select an option", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
    });

    events.keypress("4");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
       ◯ 1
       ◯ 2
       ◯ 3
      ❯◉ 4
       ◯ 5
       ◯ 6
       ◯ 7"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([4]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a number 4"');
  });

  it("use number key to deselect a selected option", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
    });

    // First select item 4
    events.keypress("4");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
       ◯ 1
       ◯ 2
       ◯ 3
      ❯◉ 4
       ◯ 5
       ◯ 6
       ◯ 7"
    `);

    // Then deselect it by pressing 4 again
    events.keypress("4");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
       ◯ 1
       ◯ 2
       ◯ 3
      ❯◯ 4
       ◯ 5
       ◯ 6
       ◯ 7"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a number"');
  });

  it("allow preselecting an option", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: [{ value: 1 }, { value: 2, checked: true }],
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◉ 2"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([2]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a number 2"');
  });

  it("allow preselecting and changing that selection", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: [{ value: 1 }, { value: 2, checked: true }],
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◉ 2"
    `);

    events.keypress("space");
    events.keypress("down");
    events.keypress("space");

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number
       ◉ 1
      ❯◯ 2"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([1]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a number 1"');
  });

  it("allow setting a smaller page size", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
      pageSize: 2,
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◯ 2
      (Use arrow keys to reveal more choices)"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([]);
  });

  it("allow setting a bigger page size", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
      pageSize: 10,
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7
       ◯ 8
       ◯ 9
       ◯ 10
      (Use arrow keys to reveal more choices)"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([]);
  });

  it("cycles through options", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
      pageSize: 2,
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◯ 2
      (Use arrow keys to reveal more choices)"
    `);

    events.keypress("up");
    events.keypress("space");
    events.keypress("up");
    events.keypress("space");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number
      ❯◉ 11
       ◉ 12"
    `);

    events.keypress("enter");
    expect(answer).resolves.toContainAllValues([11, 12]);
  });

  it("skip disabled options by arrow keys", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a topping",
      choices: [
        { name: "Ham", value: "ham" },
        { name: "Pineapple", value: "pineapple", disabled: true },
        { name: "Pepperoni", value: "pepperoni" },
      ],
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a topping (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ Ham
      - Pineapple (disabled)
       ◯ Pepperoni"
    `);

    events.keypress("down");
    events.keypress("space");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a topping
       ◯ Ham
      - Pineapple (disabled)
      ❯◉ Pepperoni"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual(["pepperoni"]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a topping Pepperoni"');
  });

  it("skip disabled options by number key", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a topping",
      choices: [
        { name: "Ham", value: "ham" },
        { name: "Pineapple", value: "pineapple", disabled: true },
        { name: "Pepperoni", value: "pepperoni" },
      ],
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a topping (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ Ham
      - Pineapple (disabled)
       ◯ Pepperoni"
    `);

    events.keypress("2");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a topping (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ Ham
      - Pineapple (disabled)
       ◯ Pepperoni"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a topping"');
  });

  it("skip separator by arrow keys", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a topping",
      choices: [
        { name: "Ham", value: "ham" },
        new Separator(),
        { name: "Pepperoni", value: "pepperoni" },
      ],
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a topping (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ Ham
       ──────────────
       ◯ Pepperoni"
    `);

    events.keypress("down");
    events.keypress("space");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a topping
       ◯ Ham
       ──────────────
      ❯◉ Pepperoni"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual(["pepperoni"]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a topping Pepperoni"');
  });

  it("allow select all", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
    });

    events.keypress("4");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
       ◯ 1
       ◯ 2
       ◯ 3
      ❯◉ 4
       ◯ 5
       ◯ 6
       ◯ 7"
    `);

    events.keypress("a");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
       ◉ 1
       ◉ 2
       ◉ 3
      ❯◉ 4
       ◉ 5
       ◉ 6
       ◉ 7"
    `);

    events.keypress("a");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
       ◯ 1
       ◯ 2
       ◯ 3
      ❯◯ 4
       ◯ 5
       ◯ 6
       ◯ 7"
    `);

    events.keypress("a");
    events.keypress("enter");
    expect(answer).resolves.toEqual(numberedChoices.map(({ value }) => value));
  });

  it("allow deselect all", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
    });

    events.keypress("4");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
       ◯ 1
       ◯ 2
       ◯ 3
      ❯◉ 4
       ◯ 5
       ◯ 6
       ◯ 7"
    `);

    events.keypress("a");
    events.keypress("a");
    events.keypress("enter");
    expect(answer).resolves.toEqual([]);
  });

  it("allow inverting selection", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
    });

    const unselect = [2, 4, 6, 7, 8, 11];
    unselect.forEach((value) => {
      events.keypress(String(value));
    });
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
       ◯ 5
       ◉ 6
       ◉ 7
      ❯◉ 8
       ◯ 9
       ◯ 10
       ◯ 11"
    `);

    events.keypress("i");
    events.keypress("enter");
    expect(answer).resolves.not.toContain(unselect);
  });

  it("allow disabling help tip", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
      instructions: false,
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number
      ❯◯ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a number"');
  });

  it("allow customizing help tip", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
      instructions:
        " (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed)",
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7
      (Use arrow keys to reveal more choices)"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([]);
    expect(getScreen()).toMatchInlineSnapshot('"✔ Select a number"');
  });

  it("throws if all choices are disabled", async () => {
    const { answer } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices.map((choice) => ({ ...choice, disabled: true })),
    });

    expect(answer).rejects.toThrowErrorMatchingInlineSnapshot(
      `"[checkbox prompt] No selectable choices. All choices are disabled."`,
    );
    expect(answer).rejects.toBeInstanceOf(ValidationError);
  });

  it("shows validation message if user did not select any choice", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
      required: true,
    });

    events.keypress("enter");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7
      > At least one choice must be selected"
    `);

    events.keypress("space");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number
      ❯◉ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual([1]);
  });

  it("shows description of the highlighted choice", async () => {
    const choices = [
      { value: "Stark", description: "Winter is coming" },
      { value: "Lannister", description: "Hear me roar" },
      { value: "Targaryen", description: "Fire and blood" },
    ];

    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a family",
      choices: choices,
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a family (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ Stark
       ◯ Lannister
       ◯ Targaryen
      Winter is coming"
    `);

    events.keypress("down");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a family (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
       ◯ Stark
      ❯◯ Lannister
       ◯ Targaryen
      Hear me roar"
    `);

    events.keypress("space");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a family
       ◯ Stark
      ❯◉ Lannister
       ◯ Targaryen
      Hear me roar"
    `);

    events.keypress("enter");
    expect(answer).resolves.toEqual(["Lannister"]);
  });

  it("uses custom validation", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
      validate: (items: ReadonlyArray<unknown>) => {
        if (items.length !== 1) {
          return "Please select only one choice";
        }
        return true;
      },
    });

    events.keypress("enter");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
      selection, and <enter> to proceed)
      ❯◯ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7
      > Please select only one choice"
    `);

    events.keypress("space");
    events.keypress("enter");
    expect(answer).resolves.toEqual([1]);
  });

  describe("theme: icon", () => {
    it("checked/unchecked", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select a number",
        choices: numberedChoices,
        theme: {
          icon: {
            checked: "√",
            unchecked: "x",
          },
        },
      });
      events.keypress("space");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number
        ❯√ 1
         x 2
         x 3
         x 4
         x 5
         x 6
         x 7"
      `);
      events.keypress("enter");
      await answer;
    });

    it("cursor", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select a number",
        choices: numberedChoices,
        theme: {
          icon: {
            cursor: ">",
          },
        },
      });
      events.keypress("space");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number
        >◉ 1
         ◯ 2
         ◯ 3
         ◯ 4
         ◯ 5
         ◯ 6
         ◯ 7"
      `);
      events.keypress("enter");
      await answer;
    });
  });

  describe("theme: style.renderSelectedChoices", () => {
    it("renderSelectedChoices", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select your favourite number.",
        choices: numberedChoices,
        theme: {
          style: {
            renderSelectedChoices: (selected: { value: number }[]) => {
              if (selected.length > 1) {
                return `You have selected ${(selected[0] as { value: number }).value} and ${selected.length - 1} more.`;
              }
              return `You have selected ${selected
                .slice(0, 1)
                .map((c) => c.value)
                .join(", ")}.`;
            },
          },
        },
      });

      events.keypress("space");
      events.keypress("down");
      events.keypress("space");
      events.keypress("down");
      events.keypress("space");
      events.keypress("enter");

      await answer;
      expect(getScreen()).toMatchInlineSnapshot(
        '"✔ Select your favourite number. You have selected 1 and 2 more."',
      );
    });

    it("allow customizing short names after selection", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select a commit",
        choices: [
          {
            name: "2cc9e311 (HEAD -> main) Fix(inquirer): Ensure no mutation of the question",
            value: "2cc9e311",
            short: "2cc9e311",
          },
          {
            name: "3272b94a (origin/main) Fix(inquirer): Fix close method not required",
            value: "3272b94a",
            short: "3272b94a",
          },
          {
            name: "e4e10545 Chore(dev-deps): Bump dev-deps",
            value: "e4e10545",
            short: "e4e10545",
          },
        ],
      });

      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a commit (Press <space> to select, <a> to toggle all, <i> to invert
        selection, and <enter> to proceed)
        ❯◯ 2cc9e311 (HEAD -> main) Fix(inquirer): Ensure no mutation of the question
         ◯ 3272b94a (origin/main) Fix(inquirer): Fix close method not required
         ◯ e4e10545 Chore(dev-deps): Bump dev-deps"
      `);

      events.keypress("space");
      events.keypress("down");
      events.keypress("space");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a commit
         ◉ 2cc9e311 (HEAD -> main) Fix(inquirer): Ensure no mutation of the question
        ❯◉ 3272b94a (origin/main) Fix(inquirer): Fix close method not required
         ◯ e4e10545 Chore(dev-deps): Bump dev-deps"
      `);

      events.keypress("enter");
      expect(answer).resolves.toEqual(["2cc9e311", "3272b94a"]);
      expect(getScreen()).toMatchInlineSnapshot(`"✔ Select a commit 2cc9e311, 3272b94a"`);
    });

    it("using allChoices parameter", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select your favourite number.",
        choices: numberedChoices,
        theme: {
          style: {
            renderSelectedChoices: (
              selected: { value: number }[],
              all: ({ value: number } | Separator)[],
            ) => {
              return `You have selected ${selected.length} out of ${all.length} options.`;
            },
          },
        },
      });

      events.keypress("space");
      events.keypress("down");
      events.keypress("down");
      events.keypress("space");
      events.keypress("enter");

      await answer;
      expect(getScreen()).toMatchInlineSnapshot(
        '"✔ Select your favourite number. You have selected 2 out of 12 options."',
      );
    });
  });

  describe("theme: helpMode", () => {
    const scrollTip = "(Use arrow keys to reveal more choices)";
    const selectTip = "Press <space> to select";

    it("helpMode: auto", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select a number",
        choices: numberedChoices,
        theme: { helpMode: "auto" },
      });

      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
        selection, and <enter> to proceed)
        ❯◯ 1
         ◯ 2
         ◯ 3
         ◯ 4
         ◯ 5
         ◯ 6
         ◯ 7
        (Use arrow keys to reveal more choices)"
      `);
      expect(getScreen()).toContain(scrollTip);
      expect(getScreen()).toContain(selectTip);

      events.keypress("down");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
        selection, and <enter> to proceed)
         ◯ 1
        ❯◯ 2
         ◯ 3
         ◯ 4
         ◯ 5
         ◯ 6
         ◯ 7"
      `);
      expect(getScreen()).not.toContain(scrollTip);
      expect(getScreen()).toContain(selectTip);

      events.keypress("space");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number
         ◯ 1
        ❯◉ 2
         ◯ 3
         ◯ 4
         ◯ 5
         ◯ 6
         ◯ 7"
      `);
      expect(getScreen()).not.toContain(scrollTip);
      expect(getScreen()).not.toContain(selectTip);

      events.keypress("enter");
      expect(answer).resolves.toEqual([2]);
      expect(getScreen()).toMatchInlineSnapshot(`"✔ Select a number 2"`);
    });

    it("helpMode: always", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select a number",
        choices: numberedChoices,
        theme: { helpMode: "always" },
      });

      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
        selection, and <enter> to proceed)
        ❯◯ 1
         ◯ 2
         ◯ 3
         ◯ 4
         ◯ 5
         ◯ 6
         ◯ 7
        (Use arrow keys to reveal more choices)"
      `);
      expect(getScreen()).toContain(scrollTip);
      expect(getScreen()).toContain(selectTip);

      events.keypress("down");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
        selection, and <enter> to proceed)
         ◯ 1
        ❯◯ 2
         ◯ 3
         ◯ 4
         ◯ 5
         ◯ 6
         ◯ 7
        (Use arrow keys to reveal more choices)"
      `);
      expect(getScreen()).toContain(scrollTip);
      expect(getScreen()).toContain(selectTip);

      events.keypress("space");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number (Press <space> to select, <a> to toggle all, <i> to invert
        selection, and <enter> to proceed)
         ◯ 1
        ❯◉ 2
         ◯ 3
         ◯ 4
         ◯ 5
         ◯ 6
         ◯ 7
        (Use arrow keys to reveal more choices)"
      `);
      expect(getScreen()).toContain(scrollTip);
      expect(getScreen()).toContain(selectTip);

      events.keypress("enter");
      expect(answer).resolves.toEqual([2]);
      expect(getScreen()).toMatchInlineSnapshot(`"✔ Select a number 2"`);
    });

    it("helpMode: never", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select a number",
        choices: numberedChoices,
        theme: { helpMode: "never" },
      });

      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number
        ❯◯ 1
         ◯ 2
         ◯ 3
         ◯ 4
         ◯ 5
         ◯ 6
         ◯ 7"
      `);
      expect(getScreen()).not.toContain(scrollTip);
      expect(getScreen()).not.toContain(selectTip);

      events.keypress("down");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number
         ◯ 1
        ❯◯ 2
         ◯ 3
         ◯ 4
         ◯ 5
         ◯ 6
         ◯ 7"
      `);
      expect(getScreen()).not.toContain(scrollTip);
      expect(getScreen()).not.toContain(selectTip);

      events.keypress("space");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number
         ◯ 1
        ❯◉ 2
         ◯ 3
         ◯ 4
         ◯ 5
         ◯ 6
         ◯ 7"
      `);
      expect(getScreen()).not.toContain(scrollTip);
      expect(getScreen()).not.toContain(selectTip);

      events.keypress("enter");
      expect(answer).resolves.toEqual([2]);
      expect(getScreen()).toMatchInlineSnapshot(`"✔ Select a number 2"`);
    });
  });

  describe("shortcuts", () => {
    it("allow select all with customized key", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select a number",
        choices: numberedChoices,
        shortcuts: {
          all: "b",
        },
      });

      events.keypress("4");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number (Press <space> to select, <b> to toggle all, <i> to invert
        selection, and <enter> to proceed)
         ◯ 1
         ◯ 2
         ◯ 3
        ❯◉ 4
         ◯ 5
         ◯ 6
         ◯ 7"
      `);

      events.keypress("b");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number (Press <space> to select, <b> to toggle all, <i> to invert
        selection, and <enter> to proceed)
         ◉ 1
         ◉ 2
         ◉ 3
        ❯◉ 4
         ◉ 5
         ◉ 6
         ◉ 7"
      `);

      events.keypress("b");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a number (Press <space> to select, <b> to toggle all, <i> to invert
        selection, and <enter> to proceed)
         ◯ 1
         ◯ 2
         ◯ 3
        ❯◯ 4
         ◯ 5
         ◯ 6
         ◯ 7"
      `);

      events.keypress("b");
      events.keypress("enter");
      expect(answer).resolves.toEqual(numberedChoices.map(({ value }) => value));
    });
  });

  it("allow inverting selection with customized key", async () => {
    const { answer, events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
      shortcuts: {
        invert: "j",
      },
    });

    const unselect = [2, 4, 6, 7, 8, 11];
    unselect.forEach((value) => {
      events.keypress(String(value));
    });
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, <a> to toggle all, <j> to invert
      selection, and <enter> to proceed)
       ◯ 5
       ◉ 6
       ◉ 7
      ❯◉ 8
       ◯ 9
       ◯ 10
       ◯ 11"
    `);

    events.keypress("j");
    events.keypress("enter");
    expect(answer).resolves.not.toContain(unselect);
  });

  it("disable `all` and `invert` keys", async () => {
    const { events, getScreen } = await render(checkbox, {
      message: "Select a number",
      choices: numberedChoices,
      shortcuts: {
        all: null,
        invert: null,
      },
    });

    // All options are deselected and should not change if default shortcuts are pressed
    const expectedScreen = getScreen();
    expect(expectedScreen).toMatchInlineSnapshot(`
      "? Select a number (Press <space> to select, and <enter> to proceed)
      ❯◯ 1
       ◯ 2
       ◯ 3
       ◯ 4
       ◯ 5
       ◯ 6
       ◯ 7
      (Use arrow keys to reveal more choices)"
    `);

    events.keypress("a");
    expect(getScreen()).toBe(expectedScreen);

    events.keypress("i");
    expect(getScreen()).toBe(expectedScreen);
  });

  describe("numeric selection with separators", () => {
    it("toggles the correct item when separators are in the middle", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select items",
        choices: [
          { value: "one", name: "One" },
          { value: "two", name: "Two" },
          new Separator(),
          { value: "three", name: "Three" },
          { value: "four", name: "Four" },
          new Separator("---"),
          { value: "five", name: "Five" },
          { value: "six", name: "Six" },
        ],
      });

      // Press '5' to toggle the 5th selectable item (which is 'Five')
      events.keypress("5");
      expect(getScreen()).toContain("❯◉ Five");

      events.keypress("enter");
      expect(answer).resolves.toEqual(["five"]);
    });

    it("toggles the correct item when separators are at the beginning", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select items",
        choices: [
          new Separator(),
          new Separator("---"),
          { value: "one", name: "One" },
          { value: "two", name: "Two" },
          { value: "three", name: "Three" },
          { value: "four", name: "Four" },
        ],
      });

      // Press '3' to toggle the 3rd selectable item (which is 'Three')
      events.keypress("3");

      expect(getScreen()).toContain("❯◉ Three");

      events.keypress("enter");
      expect(answer).resolves.toEqual(["three"]);
    });

    it("toggles the correct item when some items are disabled", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select items",
        choices: [
          { value: "one", name: "One" },
          { value: "two", name: "Two", disabled: true },
          new Separator(),
          { value: "three", name: "Three" },
          { value: "four", name: "Four", disabled: "Not available" },
          new Separator("---"),
          { value: "five", name: "Five" },
          { value: "six", name: "Six" },
        ],
      });

      // Press '3' to toggle the 3rd selectable item (which is 'Five')
      // Selectable items are One, Three, Five, Six (Two and Four are disabled)
      events.keypress("3");

      expect(getScreen()).toContain("❯◉ Three");

      events.keypress("enter");
      expect(answer).resolves.toEqual(["three"]);
    });
  });

  describe("search functionality", () => {
    const CHOICES = [
      { name: "JavaScript", value: "js" },
      { name: "TypeScript", value: "ts" },
      { name: "Python", value: "python" },
      { name: "Java", value: "java" },
      { name: "C++", value: "cpp" },
      { name: "C#", value: "csharp" },
      { name: "Go", value: "go" },
      { name: "Rust", value: "rust" },
    ];

    function getListSearch(
      choices: ReadonlyArray<
        Separator | { value: string; name?: string; disabled?: boolean | string }
      >,
    ) {
      return (term: string = "") => {
        if (!term) return choices;

        return choices.filter((choice) => {
          return (
            Separator.isSeparator(choice) ||
            (choice.name ?? choice.value).toLocaleLowerCase().includes(term.toLocaleLowerCase())
          );
        });
      };
    }

    it("allows searching and selecting options", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select programming languages",
        source: getListSearch(CHOICES),
      });

      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages 
        ❯◯ JavaScript
         ◯ TypeScript
         ◯ Python
         ◯ Java
         ◯ C++
         ◯ C#
         ◯ Go
        (Use arrow keys to reveal more choices, ctrl+a to select all)"
      `);

      events.type("Script");
      await Promise.resolve();
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages Script
        ❯◯ JavaScript
         ◯ TypeScript
        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      events.keypress("space");
      events.keypress("down");
      events.keypress("space");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages Script
         ◉ JavaScript
        ❯◉ TypeScript
        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      events.keypress("enter");
      expect(answer).resolves.toEqual(["js", "ts"]);
    });

    it("allows searching and navigating the filtered list", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select programming languages",
        source: getListSearch(CHOICES),
      });

      events.type("C++");
      await Promise.resolve();
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages C++
        ❯◯ C++
        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      events.keypress("space");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages C++
        ❯◉ C++
        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      events.keypress("enter");
      expect(answer).resolves.toEqual(["cpp"]);
    });

    it("clears search and shows all options when backspacing", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select programming languages",
        source: getListSearch(CHOICES),
      });

      events.type("Java");
      await Promise.resolve();
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages Java
        ❯◯ JavaScript
         ◯ Java
        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      events.keypress({ name: "backspace", ctrl: true });
      await Promise.resolve();
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages 
        ❯◯ JavaScript
         ◯ TypeScript
         ◯ Python
         ◯ Java
         ◯ C++
         ◯ C#
         ◯ Go
        (Use arrow keys to reveal more choices, ctrl+a to select all)"
      `);

      events.keypress("space");
      events.keypress("enter");
      expect(answer).resolves.toEqual(["js"]);
    });

    it("shows no results message when search returns empty", async () => {
      const abortController = new AbortController();
      const { answer, events, getScreen } = await render(
        checkbox,
        {
          message: "Select programming languages",
          source: getListSearch(CHOICES),
        },
        { signal: abortController.signal },
      );

      events.type("xyz");
      await Promise.resolve();
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages xyz

        > No results found
        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      events.keypress("backspace");
      events.keypress("backspace");
      events.keypress("backspace");
      await Promise.resolve();
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages 
        ❯◯ JavaScript
         ◯ TypeScript
         ◯ Python
         ◯ Java
         ◯ C++
         ◯ C#
         ◯ Go
        (Use arrow keys to reveal more choices, ctrl+a to select all)"
      `);

      abortController.abort();
      expect(answer).rejects.toThrow();
    });

    it("handles search errors and sets error message", async () => {
      const abortController = new AbortController();
      const { answer, events, getScreen } = await render(
        checkbox,
        {
          message: "Select programming languages",
          source: (term: string | undefined) => {
            if (!term) return Promise.resolve([]);
            // Return a rejected promise to trigger the catch block
            return Promise.reject(new Error("Search service unavailable"));
          },
        },
        { signal: abortController.signal },
      );

      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages 

        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      // Type to trigger search which will reject the promise
      events.type("java");
      await Promise.resolve();
      await Promise.resolve(); // Extra resolve to ensure async error is processed

      // Error should be displayed since controller is not aborted when error occurs
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages java

        > Search service unavailable
        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      abortController.abort();
      expect(answer).rejects.toThrow();
    });

    it("handles search non-Error exceptions", async () => {
      const abortController = new AbortController();
      const { answer, events, getScreen } = await render(
        checkbox,
        {
          message: "Select programming languages",
          source: (term: string | undefined) => {
            if (!term) return Promise.resolve([]);
            throw "Non-Error exception"; // Not an Error instance
          },
        },
        { signal: abortController.signal },
      );

      events.type("java");
      await Promise.resolve();
      // Should not show error message since it's not an Error instance
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages java

        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      abortController.abort();
      expect(answer).rejects.toThrow();
    });

    it("preserves selections across search terms", async () => {
      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select programming languages",
        source: getListSearch(CHOICES),
      });

      // Select JavaScript first
      events.keypress("space");
      await Promise.resolve();
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages 
        ❯◉ JavaScript
         ◯ TypeScript
         ◯ Python
         ◯ Java
         ◯ C++
         ◯ C#
         ◯ Go
        (Use arrow keys to reveal more choices, ctrl+a to select all)"
      `);

      // Search for 'Python'
      events.type("Python");
      await Promise.resolve();
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages Python
        ❯◯ Python
        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      // Select Python
      events.keypress("space");
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages Python
        ❯◉ Python
        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      // Clear search - both selections should still be there
      events.keypress({ name: "backspace", ctrl: true });
      await Promise.resolve();
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select programming languages 
        ❯◉ JavaScript
         ◯ TypeScript
         ◉ Python
         ◯ Java
         ◯ C++
         ◯ C#
         ◯ Go
        (Use arrow keys to reveal more choices, ctrl+a to select all)"
      `);

      events.keypress("enter");
      expect(answer).resolves.toEqual(["js", "python"]);
    });

    it("works with separators and disabled choices in search", async () => {
      const choices = [
        new Separator("~ Popular ~"),
        { value: "JavaScript", name: "JavaScript" },
        { value: "Python", name: "Python" },
        new Separator("~ Compiled ~"),
        { value: "C++", name: "C++", disabled: "Not available" },
        { value: "Go", name: "Go" },
        { value: "Rust", name: "Rust" },
      ];

      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select a language",
        source: getListSearch(choices),
      });

      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a language 
         ~ Popular ~
        ❯◯ JavaScript
         ◯ Python
         ~ Compiled ~
        - C++ Not available
         ◯ Go
         ◯ Rust
        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      events.type("Go");
      await Promise.resolve();
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a language Go
         ~ Popular ~
         ~ Compiled ~
        ❯◯ Go
        (Use arrow keys to navigate, ctrl+a to select all)"
      `);

      events.keypress("space");
      events.keypress("enter");
      expect(answer).resolves.toEqual(["Go"]);
    });

    it("shows description of highlighted choice during search", async () => {
      const choicesWithDescriptions = [
        { value: "js", name: "JavaScript", description: "Popular web language" },
        { value: "ts", name: "TypeScript", description: "JavaScript with types" },
        { value: "python", name: "Python", description: "Great for data science" },
      ];

      const { answer, events, getScreen } = await render(checkbox, {
        message: "Select a language",
        source: getListSearch(choicesWithDescriptions),
      });

      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a language 
        ❯◯ JavaScript
         ◯ TypeScript
         ◯ Python
        (Use arrow keys to navigate, ctrl+a to select all)
        Popular web language"
      `);

      events.type("Type");
      await Promise.resolve();
      expect(getScreen()).toMatchInlineSnapshot(`
        "? Select a language Type
        ❯◯ TypeScript
        (Use arrow keys to navigate, ctrl+a to select all)
        JavaScript with types"
      `);

      events.keypress("space");
      events.keypress("enter");
      expect(answer).resolves.toEqual(["ts"]);
    });
  });
});
