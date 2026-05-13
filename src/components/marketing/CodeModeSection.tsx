import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CodeBlock, Token } from "@/components/ui/CodeBlock";

export function CodeModeSection() {
  return (
    <Section tone="ink" density="spacious" id="code">
      <Container width="wide">
        <div className="max-w-3xl">
          <Eyebrow tone="accent">Code Mode</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold leading-tight">
            Practice the syntax you actually write.
          </h2>
          <p className="mt-4 text-base text-paper/70 leading-relaxed">
            Type TypeScript, Python, Rust, Go, and 40+ more languages — with real syntax highlighting,
            real indentation, and the special characters that actually slow you down.
          </p>
        </div>

        <div className="mt-10 max-w-3xl">
          <CodeBlock>
            <Token.Comment>// Practice code in 40+ languages</Token.Comment>{"\n"}
            <Token.Prompt>$</Token.Prompt> touch-typer code --lang=typescript{"\n\n"}
            <Token.Keyword>function</Token.Keyword> wpm(chars: <Token.Keyword>number</Token.Keyword>, seconds: <Token.Keyword>number</Token.Keyword>) {"{"}{"\n"}
            {"  "}<Token.Keyword>return</Token.Keyword> (chars / 5) / (seconds / 60);{"\n"}
            {"}"}{"\n\n"}
            <Token.Comment>// you wrote that in 4.2s · 81 wpm · 0 errors</Token.Comment>
          </CodeBlock>
        </div>
      </Container>
    </Section>
  );
}
