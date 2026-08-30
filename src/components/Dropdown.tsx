"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { Label } from "./Field";

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

/**
 * A real listbox rather than a native <select>.
 *
 * The browser draws a native select's popup itself — it ignores every one of
 * our borders, colors and shadows, so on this design it landed as a pale OS
 * menu with a blue highlight in the middle of a neo-brutalist form. This
 * renders the list as markup we control, and keeps the keyboard contract a
 * select has: Enter/Space/arrows to open, arrows to move, Enter to pick,
 * Escape to dismiss, Home/End to jump, and type-ahead.
 */
export default function Dropdown<T extends string>({
  id,
  label,
  hint,
  value,
  options,
  onChange,
  placeholder = "Select an option",
}: {
  id: string;
  label: string;
  hint?: string;
  value: T | "";
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Type-ahead buffer. A ref, not state: it never affects what renders, and
  // rewriting it must not cost a render on every keystroke.
  const typed = useRef({ text: "", at: 0 });

  const listId = useId();
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  // Dismiss on an outside press, so the list behaves like the native popup.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  // Move real focus into the list while it's open so keystrokes land here
  // and screen readers announce the active option.
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  // Keep the highlighted row visible when arrowing through a long list.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function openList(startAt = selectedIndex >= 0 ? selectedIndex : 0) {
    setActiveIndex(startAt);
    setOpen(true);
  }

  function closeList({ refocus = true }: { refocus?: boolean } = {}) {
    setOpen(false);
    setActiveIndex(-1);
    if (refocus) buttonRef.current?.focus();
  }

  function pick(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    closeList();
  }

  // `at` comes from the keyboard event rather than a clock read: the event
  // already carries a monotonic timestamp, and reading a clock inside a
  // component body is a purity violation.
  function matchTyped(key: string, at: number) {
    // Same 500ms window a native select uses before starting a new match.
    typed.current = {
      text: at - typed.current.at > 500 ? key : typed.current.text + key,
      at,
    };
    const query = typed.current.text.toLowerCase();
    const found = options.findIndex((o) => o.label.toLowerCase().startsWith(query));
    if (found >= 0) {
      if (open) setActiveIndex(found);
      else onChange(options[found].value);
    }
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openList();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      openList(selectedIndex >= 0 ? selectedIndex : options.length - 1);
      return;
    }
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      matchTyped(e.key, e.timeStamp);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        pick(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        closeList();
        break;
      case "Tab":
        // Tabbing away commits nothing and gets out of the way.
        closeList({ refocus: false });
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          matchTyped(e.key, e.timeStamp);
        }
    }
  }

  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>

      <div ref={rootRef} className="relative mt-2">
        <button
          ref={buttonRef}
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => (open ? closeList() : openList())}
          onKeyDown={onTriggerKeyDown}
          className="flex w-full items-center justify-between gap-3 border border-border bg-card-muted px-4 py-3 text-left text-foreground focus:outline-none focus:ring-2 focus:ring-ink"
        >
          <span className={selected ? "text-foreground" : "text-muted-foreground"}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            aria-activedescendant={
              activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
            }
            tabIndex={-1}
            onKeyDown={onListKeyDown}
            className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-64 overflow-y-auto border border-border bg-card shadow-card focus:outline-none"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => pick(index)}
                  className={`flex cursor-pointer items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0 ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                  }`}
                >
                  <span>
                    <span className="font-bold">{option.label}</span>
                    {option.hint && (
                      <span
                        className={`mt-0.5 block text-xs ${
                          isActive ? "text-secondary-foreground" : "text-secondary-foreground"
                        }`}
                      >
                        {option.hint}
                      </span>
                    )}
                  </span>
                  {isSelected && <CheckIcon className="h-4 w-4 shrink-0" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
