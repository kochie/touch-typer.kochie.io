"use client";

import LeaderboardSection from "@/components/LeaderboardSection";
import { Field, Fieldset, Label, Select } from "@headlessui/react";
import { useReducer } from "react";

interface State {
  level: string;
  keyboard: string;
  language: string;
}

type Actions =
  | { type: "setLevel"; level: string }
  | { type: "setKeyboard"; keyboard: string }
  | { type: "setLanguage"; language: string };

function reducer(state: State, action: Actions) {
  switch (action.type) {
    case "setLevel":
      return {
        ...state,
        level: action.level,
      };
    case "setKeyboard":
      return {
        ...state,
        keyboard: action.keyboard,
      };
    case "setLanguage":
      return {
        ...state,
        language: action.language,
      };
    default:
      return state;
  }
}

export enum KeyboardLayoutNames {
  MACOS_US_QWERTY = "MACOS_US_QWERTY",
  MACOS_US_DVORAK = "MACOS_US_DVORAK",
  MACOS_US_COLEMAK = "MACOS_US_COLEMAK",
  MACOS_FR_AZERTY = "MACOS_FR_AZERTY",
  MACOS_DE_QWERTZ = "MACOS_DE_QWERTZ",
  MACOS_ES_QWERTY = "MACOS_ES_QWERTY",
}

export enum Levels {
  LEVEL_1 = "1",
  LEVEL_2 = "2",
  LEVEL_3 = "3",
}

export enum Languages {
  ENGLISH = "en",
  FRENCH = "fr",
  GERMAN = "de",
  SPANISH = "es",
}

export default function LeaderboardPage() {
  const [{ keyboard, language, level }, dispatch] = useReducer(reducer, {
    level: Levels.LEVEL_1,
    keyboard: KeyboardLayoutNames.MACOS_US_QWERTY,
    language: Languages.ENGLISH,
  });

  return (
    <div className="max-w-5xl mx-auto">
    <Fieldset>
      <Field>
        <Label className="block">Keyboard</Label>
        <Select className="mt-1 block" name="keyboard" value={keyboard} onChange={(event) => dispatch({type: "setKeyboard", keyboard: event.target.value})}>
            <option value={KeyboardLayoutNames.MACOS_US_QWERTY}>QWERTY</option>
            <option value={KeyboardLayoutNames.MACOS_US_DVORAK}>DVORAK</option>
            <option value={KeyboardLayoutNames.MACOS_US_COLEMAK}>COLEMAK</option>
            <option value={KeyboardLayoutNames.MACOS_FR_AZERTY}>AZERTY</option>
            <option value={KeyboardLayoutNames.MACOS_DE_QWERTZ}>QWERTZ</option>
            <option value={KeyboardLayoutNames.MACOS_ES_QWERTY}>QWERTY</option>
        </Select>
      </Field>

      <LeaderboardSection
        keyboard={keyboard}
        language={language}
        level={level}
      />
    </Fieldset>
    </div>
  );
}
