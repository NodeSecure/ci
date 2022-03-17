import kleur from "kleur";

export type ConsoleMessage = {
  message: string;
  underline: () => ConsoleMessage;
  italic: () => ConsoleMessage;
  bold: () => ConsoleMessage;
  prefix: (message: string) => ConsoleMessage;
  suffix: (message: string) => ConsoleMessage;
  print: () => void;
  printWithEmptyLine: () => void;
};

export type ConsoleOutput<Output = string, Input = string> = (
  message: Input
) => Output;

type ConsolePrinter = {
  font: {
    standard: ConsoleOutput<ConsoleMessage>;
    highlight: ConsoleOutput<ConsoleMessage>;
    info: ConsoleOutput<ConsoleMessage>;
    error: ConsoleOutput<ConsoleMessage>;
    success: ConsoleOutput<ConsoleMessage>;
    highlightedSuccess: ConsoleOutput<ConsoleMessage>;
    highlightedError: ConsoleOutput<ConsoleMessage>;
  };
  decoration: {
    bold: ConsoleOutput;
    underline: ConsoleOutput;
    italic: ConsoleOutput;
  };
  util: {
    concatOutputs: ConsoleOutput<ConsoleMessage, string[]>;
    emptyLine: () => void;
  };
};

function createConsoleMessage(message: string): ConsoleMessage {
  return {
    message,
    bold(): ConsoleMessage {
      this.message = consolePrinter.decoration.bold(this.message);

      return this;
    },
    italic(): ConsoleMessage {
      this.message = consolePrinter.decoration.italic(this.message);

      return this;
    },
    underline(): ConsoleMessage {
      this.message = consolePrinter.decoration.underline(this.message);

      return this;
    },
    prefix(msg?: string): ConsoleMessage {
      this.message = `${msg} ${this.message}`;

      return this;
    },
    suffix(msg?: string): ConsoleMessage {
      this.message = `${this.message} ${msg}`;

      return this;
    },
    print(): void {
      console.log(`${this.message}`);
    },
    printWithEmptyLine(): void {
      console.log(`\n ${this.message}`);
    }
  };
}

export const consolePrinter: ConsolePrinter = {
  font: {
    standard: (message: string) => createConsoleMessage(kleur.white(message)),
    highlight: (message: string) =>
      createConsoleMessage(kleur.magenta(message)),
    info: (message: string) => createConsoleMessage(kleur.yellow(message)),
    error: (message: string) => createConsoleMessage(kleur.red(message)),
    success: (message: string) => createConsoleMessage(kleur.green(message)),
    highlightedSuccess: (message: string) =>
      createConsoleMessage(kleur.bgGreen().bold().white(message)),
    highlightedError: (message: string) =>
      createConsoleMessage(kleur.bgRed().bold().white(message))
  },
  decoration: {
    underline: (message: string) => kleur.underline(message),
    italic: (message: string) => kleur.italic(message),
    bold: (message: string) => kleur.bold(message)
  },
  util: {
    concatOutputs: (messages: string[], delimiter = " ") =>
      createConsoleMessage(messages.join(delimiter)),
    emptyLine: () => console.log()
  }
};

export function removeWhiteSpaces(msg: string): string {
  return msg.replace(/\s\s+/g, " ");
}
