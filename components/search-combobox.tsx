"use client";

import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type Props = {
  name: string;
  options: readonly string[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

export function SearchCombobox({
  name,
  options,
  defaultValue = "",
  placeholder = "検索…",
  required = false,
}: Props) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(defaultValue);
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ja");

    // 空欄なら全候補を表示
    if (!normalizedQuery) {
      return options.slice(0, 8);
    }

    return options
      .filter((option) =>
        option.toLocaleLowerCase("ja").includes(normalizedQuery),
      )
      .slice(0, 8);
  }, [options, query]);

  function select(value: string) {
    setQuery(value);
    setSelectedValue(value);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length === 0) return;
      setOpen(true);
      setActiveIndex((current) => {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const start = current < 0 ? (direction > 0 ? -1 : results.length) : current;
        return (start + direction + results.length) % results.length;
      });
      return;
    }

    if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      select(results[activeIndex]);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="search-combobox">
      <input name={name} readOnly type="hidden" value={selectedValue} />
      <input
        ref={inputRef}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
        }
        autoComplete="off"
        placeholder={placeholder}
        required={required}
        value={query}
        onChange={(event) => {
          const value = event.target.value;

          setQuery(value);
          setSelectedValue(""); // まだ候補を選んでいない
          setOpen(true);        // 常に候補を表示
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          window.setTimeout(() => {
            const exactMatch = options.find(
              (option) =>
                option.toLocaleLowerCase("ja") ===
                query.trim().toLocaleLowerCase("ja"),
            );
            if (exactMatch) {
              setQuery(exactMatch);
              setSelectedValue(exactMatch);
            } else {
              setQuery(selectedValue);
            }
            setOpen(false);
          }, 100);
        }}
      />

      {open && (
        <ul id={listboxId} role="listbox" className="search-combobox-list">
          {results.map((value, index) => (
            <li
              id={`${id}-option-${index}`}
              key={value}
              role="option"
              aria-selected={value === selectedValue}
              className={index === activeIndex ? "is-active" : undefined}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                select(value);
                inputRef.current?.focus();
              }}
            >
              {value}
            </li>
          ))}
          {results.length === 0 && query && (
            <li className="search-combobox-empty">候補がありません</li>
          )}
        </ul>
      )}
    </div>
  );
}
