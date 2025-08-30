import {
  createPrompt,
  isDownKey,
  isEnterKey,
  isNumberKey,
  isSpaceKey,
  isUpKey,
  makeTheme,
  Separator,
  type Status,
  type Theme,
  useEffect,
  useKeypress,
  useMemo,
  usePagination,
  usePrefix,
  useRef,
  useState,
  ValidationError,
} from "@inquirer/core";
import figures from "@inquirer/figures";
import type { PartialDeep } from "@inquirer/type";
import ansiEscapes from "ansi-escapes";
import colors from "yoctocolors-cjs";

type CheckboxTheme = {
  icon: {
    checked: string;
    unchecked: string;
    cursor: string;
  };
  style: {
    disabledChoice: (text: string) => string;
    renderSelectedChoices: <T>(
      selectedChoices: ReadonlyArray<NormalizedChoice<T>>,
      allChoices: ReadonlyArray<NormalizedChoice<T> | Separator>,
    ) => string;
    description: (text: string) => string;
    searchTerm: (text: string) => string;
  };
  helpMode: "always" | "never" | "auto";
};

type CheckboxShortcuts = {
  all?: string | null;
  invert?: string | null;
};

const checkboxTheme: CheckboxTheme = {
  icon: {
    checked: colors.green(figures.circleFilled),
    unchecked: figures.circle,
    cursor: figures.pointer,
  },
  style: {
    disabledChoice: (text: string) => colors.dim(`- ${text}`),
    renderSelectedChoices: (selectedChoices) =>
      selectedChoices.map((choice) => choice.short).join(", "),
    description: (text: string) => colors.cyan(text),
    searchTerm: (text: string) => colors.cyan(text),
  },
  helpMode: "auto",
};

type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
  checked?: boolean;
  type?: never;
};

type NormalizedChoice<Value> = {
  value: Value;
  name: string;
  description?: string;
  short: string;
  disabled: boolean | string;
  checked: boolean;
};

type CheckboxConfig<
  Value,
  ChoicesObject = ReadonlyArray<string | Separator> | ReadonlyArray<Choice<Value> | Separator>,
> = {
  message: string;
  prefix?: string;
  pageSize?: number;
  instructions?: string | boolean;
  choices?: ChoicesObject extends ReadonlyArray<string | Separator>
    ? ChoicesObject
    : ReadonlyArray<Choice<Value> | Separator>;
  source?: (
    term: string | undefined,
    opt: { signal: AbortSignal },
  ) => ChoicesObject extends ReadonlyArray<string | Separator>
    ? ChoicesObject | Promise<ChoicesObject>
    : ReadonlyArray<Choice<Value> | Separator> | Promise<ReadonlyArray<Choice<Value> | Separator>>;
  loop?: boolean;
  required?: boolean;
  validate?: (
    choices: ReadonlyArray<Choice<Value>>,
  ) => boolean | string | Promise<string | boolean>;
  theme?: PartialDeep<Theme<CheckboxTheme>>;
  shortcuts?: CheckboxShortcuts;
};

type Item<Value> = NormalizedChoice<Value> | Separator;

function isSelectable<Value>(item: Item<Value>): item is NormalizedChoice<Value> {
  return !Separator.isSeparator(item) && !item.disabled;
}

function toggle<Value>(item: Item<Value>): Item<Value> {
  return isSelectable(item) ? { ...item, checked: !item.checked } : item;
}

function check(checked: boolean) {
  return <Value>(item: Item<Value>): Item<Value> =>
    isSelectable(item) ? { ...item, checked } : item;
}

function normalizeChoices<Value>(
  choices: ReadonlyArray<string | Separator> | ReadonlyArray<Choice<Value> | Separator>,
): Item<Value>[] {
  return choices.map((choice) => {
    if (Separator.isSeparator(choice)) return choice;

    if (typeof choice === "string") {
      return {
        value: choice as Value,
        name: choice,
        short: choice,
        disabled: false,
        checked: false,
      };
    }

    const name = choice.name ?? String(choice.value);
    const normalizedChoice: NormalizedChoice<Value> = {
      value: choice.value,
      name,
      short: choice.short ?? name,
      disabled: choice.disabled ?? false,
      checked: choice.checked ?? false,
    };

    if (choice.description) {
      normalizedChoice.description = choice.description;
    }

    return normalizedChoice;
  });
}

export default createPrompt(
  <Value>(config: CheckboxConfig<Value>, done: (value: Array<Value>) => void) => {
    const { instructions, pageSize = 7, loop = true, required, validate = () => true } = config;
    const shortcuts = { all: "a", invert: "i", ...config.shortcuts };
    const theme = makeTheme<CheckboxTheme>(checkboxTheme, config.theme);
    const firstRender = useRef(true);
    const [status, setStatus] = useState<Status>(config.source ? "loading" : "idle");
    const prefix = usePrefix({ status, theme });

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchError, setSearchError] = useState<string>();

    const initialItems = config.choices ? normalizeChoices(config.choices) : [];
    const initialSelectedChoices = new Map<Value, NormalizedChoice<Value>>(
      initialItems
        .filter(
          (item): item is NormalizedChoice<Value> => !Separator.isSeparator(item) && item.checked,
        )
        .map((item) => [item.value, item]),
    );

    const [selectedChoices, setSelectedChoices] =
      useState<Map<Value, NormalizedChoice<Value>>>(initialSelectedChoices);
    const [items, setItems] = useState<ReadonlyArray<Item<Value>>>(initialItems);

    useEffect(() => {
      const { source } = config;
      if (!source) return;

      const controller = new AbortController();
      setStatus("loading");
      setSearchError(undefined);

      const fetchResults = async () => {
        try {
          const results = await source(searchTerm || undefined, {
            signal: controller.signal,
          });

          if (!controller.signal.aborted) {
            const normalizedResults = normalizeChoices(results);

            // Preserve selected state from selectedChoices
            const itemsWithSelection = normalizedResults.map((item) => {
              if (!Separator.isSeparator(item)) {
                return {
                  ...item,
                  checked: selectedChoices.has(item.value),
                };
              }
              return item;
            });
            setItems(itemsWithSelection);
            // Reset active to first selectable item after search
            const firstSelectable = itemsWithSelection.findIndex(isSelectable);
            if (firstSelectable >= 0) {
              setActive(firstSelectable);
            }
            setSearchError(undefined);
            setStatus("idle");
          }
        } catch (error: unknown) {
          if (!controller.signal.aborted && error instanceof Error) {
            setSearchError(error.message);
          }
        }
      };

      void fetchResults();

      return () => {
        controller.abort();
      };
    }, [searchTerm, config.source, selectedChoices]);

    const bounds = useMemo(() => {
      const first = items.findIndex(isSelectable);
      const last = items.findLastIndex(isSelectable);

      if (first === -1 && !config.source && status !== "loading") {
        throw new ValidationError(
          "[checkbox prompt] No selectable choices. All choices are disabled.",
        );
      }

      return { first, last };
    }, [items, config.source, status]);

    const [active, setActive] = useState(bounds.first >= 0 ? bounds.first : 0);
    const [showHelpTip, setShowHelpTip] = useState(true);
    const [errorMsg, setError] = useState<string>();

    useKeypress(async (key, rl) => {
      if (isEnterKey(key)) {
        const selectionChoices = Array.from(selectedChoices.values());
        const isValid = await validate(selectionChoices);
        if (required && selectedChoices.size === 0) {
          setError("At least one choice must be selected");
        } else if (isValid === true) {
          setStatus("done");
          done(selectionChoices.map((choice) => choice.value));
        } else {
          setError(isValid || "You must select a valid value");
        }
      } else if (isUpKey(key) || isDownKey(key)) {
        if (
          loop ||
          (isUpKey(key) && active !== bounds.first) ||
          (isDownKey(key) && active !== bounds.last)
        ) {
          const offset = isUpKey(key) ? -1 : 1;
          let next = active;
          do {
            next = (next + offset + items.length) % items.length;
            // biome-ignore lint/style/noNonNullAssertion: we need to access items dynamically
          } while (!isSelectable(items[next]!));
          setActive(next);
        }
      } else if (isSpaceKey(key)) {
        setError(undefined);
        setShowHelpTip(false);
        if (config.source) {
          // In search mode, prevent space from being added to search term
          rl.clearLine(0);
          rl.write(searchTerm); // Restore search term without the space
        }
        const activeItem = items[active];
        if (activeItem && isSelectable(activeItem)) {
          const newSelectedChoices = new Map(selectedChoices);
          if (selectedChoices.has(activeItem.value)) {
            newSelectedChoices.delete(activeItem.value);
          } else {
            newSelectedChoices.set(activeItem.value, activeItem);
          }
          setSelectedChoices(newSelectedChoices);
          setItems(items.map((choice, i) => (i === active ? toggle(choice) : choice)));
        }
      } else if (key.name === shortcuts.all && !config.source) {
        const selectAll = items.some((choice) => isSelectable(choice) && !choice.checked);
        const newSelectedChoices = new Map<Value, NormalizedChoice<Value>>();
        if (selectAll) {
          items.forEach((item) => {
            if (isSelectable(item)) {
              newSelectedChoices.set(item.value, item);
            }
          });
        }
        setSelectedChoices(newSelectedChoices);
        setItems(items.map(check(selectAll)));
      } else if (key.name === shortcuts.invert && !config.source) {
        const newSelectedChoices = new Map<Value, NormalizedChoice<Value>>();
        items.forEach((item) => {
          if (isSelectable(item)) {
            if (!selectedChoices.has(item.value)) {
              newSelectedChoices.set(item.value, item);
            }
          }
        });
        setSelectedChoices(newSelectedChoices);
        setItems(items.map(toggle));
      } else if (isNumberKey(key) && !config.source) {
        const selectedIndex = Number(key.name) - 1;

        // Find the nth item (ignoring separators)
        let selectableIndex = -1;
        const position = items.findIndex((item) => {
          if (Separator.isSeparator(item)) return false;

          selectableIndex++;
          return selectableIndex === selectedIndex;
        });

        const selectedItem = items[position];
        if (selectedItem && isSelectable(selectedItem)) {
          setActive(position);
          const newSelectedChoices = new Map(selectedChoices);
          if (selectedChoices.has(selectedItem.value)) {
            newSelectedChoices.delete(selectedItem.value);
          } else {
            newSelectedChoices.set(selectedItem.value, selectedItem);
          }
          setSelectedChoices(newSelectedChoices);
          setItems(items.map((choice, i) => (i === position ? toggle(choice) : choice)));
        }
      } else if (config.source && !isSpaceKey(key)) {
        setSearchTerm(rl.line);
      }
    });

    const message = theme.style.message(config.message, status);

    let description: string | undefined;
    const page = usePagination({
      items,
      active,
      renderItem({ item, isActive }) {
        if (Separator.isSeparator(item)) {
          return ` ${item.separator}`;
        }

        if (item.disabled) {
          const disabledLabel = typeof item.disabled === "string" ? item.disabled : "(disabled)";
          return theme.style.disabledChoice(`${item.name} ${disabledLabel}`);
        }

        if (isActive) {
          description = item.description;
        }

        const checkbox = item.checked ? theme.icon.checked : theme.icon.unchecked;
        const color = isActive ? theme.style.highlight : (x: string) => x;
        const cursor = isActive ? theme.icon.cursor : " ";
        return color(`${cursor}${checkbox} ${item.name}`);
      },
      pageSize,
      loop,
    });

    if (status === "done") {
      const selection = Array.from(selectedChoices.values());
      const answer = theme.style.answer(theme.style.renderSelectedChoices(selection, items));

      return `${prefix} ${message} ${answer}`;
    }

    let helpTipTop = "";
    let helpTipBottom = "";
    if (
      theme.helpMode === "always" ||
      (theme.helpMode === "auto" && showHelpTip && (instructions === undefined || instructions))
    ) {
      if (typeof instructions === "string") {
        helpTipTop = instructions;
      } else {
        const keys = [
          `${theme.style.key("space")} to select`,
          !config.source && shortcuts.all ? `${theme.style.key(shortcuts.all)} to toggle all` : "",
          !config.source && shortcuts.invert
            ? `${theme.style.key(shortcuts.invert)} to invert selection`
            : "",
          `and ${theme.style.key("enter")} to proceed`,
        ];
        helpTipTop = ` (Press ${keys.filter((key) => key !== "").join(", ")})`;
      }

      if (
        items.length > pageSize &&
        (theme.helpMode === "always" ||
          (theme.helpMode === "auto" && (firstRender.current || config.source)))
      ) {
        helpTipBottom = `\n${theme.style.help("(Use arrow keys to reveal more choices)")}`;
        if (!config.source) {
          firstRender.current = false;
        }
      }
    }

    const choiceDescription = description ? `\n${theme.style.description(description)}` : ``;

    let error = "";
    if (searchError) {
      error = `\n${theme.style.error(searchError)}`;
    } else if (config.source && items.length === 0 && searchTerm !== "" && status === "idle") {
      error = `\n${theme.style.error("No results found")}`;
    } else if (errorMsg) {
      error = `\n${theme.style.error(errorMsg)}`;
    }

    if (config.source) {
      const searchStr = theme.style.searchTerm(searchTerm);
      return [
        [prefix, message, searchStr].filter(Boolean).join(" "),
        `${error || page}${helpTipBottom}${choiceDescription}`,
      ];
    }

    return `${prefix} ${message}${helpTipTop}\n${page}${helpTipBottom}${choiceDescription}${error}${ansiEscapes.cursorHide}`;
  },
);
