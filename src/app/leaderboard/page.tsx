"use client";

import LeaderboardSection from "@/components/LeaderboardSection";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { KeyboardLayoutNames, Languages, Levels } from "@/utils/enums";
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


export default function LeaderboardPage() {
  const [{ keyboard, language, level }, dispatch] = useReducer(reducer, {
    level: Levels.LEVEL_1,
    keyboard: KeyboardLayoutNames.MACOS_US_QWERTY,
    language: Languages.ENGLISH,
  });

  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="default">
          <Eyebrow>Leaderboard</Eyebrow>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            Top typists, globally.
          </h1>
          <p className="mt-4 text-base text-ink/70">
            Updated in near real time. Filter by layout and time window.
          </p>

          <div className="mt-8">
            <Fieldset>
              <Field>
                <Label className="block text-sm font-medium text-ink/80 mb-1">
                  Keyboard
                </Label>
                <Select
                  className="mt-1 block rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  name="keyboard"
                  value={keyboard}
                  onChange={(event) =>
                    dispatch({ type: "setKeyboard", keyboard: event.target.value })
                  }
                >
                  <option value={KeyboardLayoutNames.MACOS_US_QWERTY}>QWERTY</option>
                  <option value={KeyboardLayoutNames.MACOS_US_DVORAK}>DVORAK</option>
                  <option value={KeyboardLayoutNames.MACOS_US_COLEMAK}>COLEMAK</option>
                  <option value={KeyboardLayoutNames.MACOS_FR_AZERTY}>AZERTY</option>
                  <option value={KeyboardLayoutNames.MACOS_DE_QWERTZ}>QWERTZ</option>
                  <option value={KeyboardLayoutNames.MACOS_ES_QWERTY}>QWERTY</option>
                </Select>
              </Field>
            </Fieldset>
          </div>

          <div className="mt-12">
            <LeaderboardSection
              keyboard={keyboard}
              language={language}
              level={level}
            />
          </div>
        </Container>
      </Section>
    </main>
  );
}
