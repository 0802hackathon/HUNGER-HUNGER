"use client";

import {
  useId,
  useState,
  type InputHTMLAttributes,
  type InputEvent,
  type TextareaHTMLAttributes,
} from "react";

type CharacterCountProps = {
  currentLength: number;
  maxLength?: number;
  perLine?: boolean;
};

export function CharacterCount({
  currentLength,
  maxLength,
  perLine = false,
}: CharacterCountProps) {
  if (maxLength === undefined) {
    return <span className="character-count">{currentLength}文字入力済み</span>;
  }

  const remaining = maxLength - currentLength;
  const stateClass =
    remaining < 0
      ? " is-over-limit"
      : remaining <= Math.max(10, Math.floor(maxLength * 0.1))
        ? " is-near-limit"
        : "";
  const prefix = perLine ? "最長の行：" : "";
  const detail =
    remaining >= 0 ? `残り${remaining}文字` : `${Math.abs(remaining)}文字超過`;

  return (
    <span className={`character-count${stateClass}`}>
      {prefix}
      {detail}（最大{maxLength}文字）
    </span>
  );
}

type CountedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "maxLength"> & {
  maxLength?: number;
};

export function CountedInput({
  "aria-describedby": describedBy,
  defaultValue,
  maxLength,
  onInput,
  value,
  ...props
}: CountedInputProps) {
  const countId = useId();
  const initialValue = value ?? defaultValue ?? "";
  const [currentLength, setCurrentLength] = useState(
    String(initialValue).length,
  );

  function handleInput(event: InputEvent<HTMLInputElement>) {
    setCurrentLength(event.currentTarget.value.length);
    onInput?.(event);
  }

  return (
    <>
      <input
        {...props}
        aria-describedby={
          describedBy ? `${describedBy} ${countId}` : countId
        }
        defaultValue={defaultValue}
        maxLength={maxLength}
        onInput={handleInput}
        value={value}
      />
      <span id={countId}>
        <CharacterCount
          currentLength={currentLength}
          maxLength={maxLength}
        />
      </span>
    </>
  );
}

type CountedTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "maxLength"
> & {
  maxLength: number;
  perLine?: boolean;
};

function longestTrimmedLineLength(value: string) {
  return value
    .split("\n")
    .reduce((longest, line) => Math.max(longest, line.trim().length), 0);
}

export function CountedTextarea({
  "aria-describedby": describedBy,
  defaultValue,
  maxLength,
  onInput,
  perLine = false,
  value,
  ...props
}: CountedTextareaProps) {
  const countId = useId();
  const initialValue = String(value ?? defaultValue ?? "");
  const [currentLength, setCurrentLength] = useState(
    perLine ? longestTrimmedLineLength(initialValue) : initialValue.length,
  );

  function handleInput(event: InputEvent<HTMLTextAreaElement>) {
    const nextLength = perLine
      ? longestTrimmedLineLength(event.currentTarget.value)
      : event.currentTarget.value.length;
    setCurrentLength(nextLength);
    event.currentTarget.setCustomValidity(
      perLine && nextLength > maxLength
        ? `1行を${maxLength}文字以内で入力してください。`
        : "",
    );
    onInput?.(event);
  }

  return (
    <>
      <textarea
        {...props}
        aria-describedby={
          describedBy ? `${describedBy} ${countId}` : countId
        }
        defaultValue={defaultValue}
        maxLength={perLine ? undefined : maxLength}
        onInput={handleInput}
        value={value}
      />
      <span id={countId}>
        <CharacterCount
          currentLength={currentLength}
          maxLength={maxLength}
          perLine={perLine}
        />
      </span>
    </>
  );
}
