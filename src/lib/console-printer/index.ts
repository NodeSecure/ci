import kleur from "kleur";

type ConsoleMessage = {
  message: string;
  underline: () => ConsoleMessage;
  italic: () => ConsoleMessage;
  bold: () => ConsoleMessage;
  print: () => void;
};

type ConsoleOutput<Output = string, Input = string> = (
  message: Input
) => Output;

type ConsolePrinter = {
  font: {
    standard: ConsoleOutput<ConsoleMessage>;
    highlight: ConsoleOutput<ConsoleMessage>;
    info: ConsoleOutput<ConsoleMessage>;
    error: ConsoleOutput<ConsoleMessage>;
    success: ConsoleOutput<ConsoleMessage>;
    failure: ConsoleOutput<ConsoleMessage>;
  };
  decoration: {
    bold: ConsoleOutput;
    underline: ConsoleOutput;
    italic: ConsoleOutput;
  };
  util: {
    concatOutputs: ConsoleOutput<ConsoleMessage, string[]>;
  };
};

function createConsoleMessage(msg: string): ConsoleMessage {
  return {
    message: msg,
    bold() {
      this.message = consolePrinter.decoration.bold(this.message);

      return this;
    },
    italic() {
      this.message = consolePrinter.decoration.italic(this.message);

      return this;
    },
    underline() {
      this.message = consolePrinter.decoration.underline(this.message);

      return this;
    },
    print() {
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
    success: (message: string) =>
      createConsoleMessage(kleur.bgGreen().white(message)),
    failure: (message: string) =>
      createConsoleMessage(kleur.bgRed().white(message))
  },
  decoration: {
    underline: (message: string) => kleur.underline(message),
    italic: (message: string) => kleur.italic(message),
    bold: (message: string) => kleur.bold(message)
  },
  util: {
    concatOutputs: (messages: string[], delimiter = " ") =>
      createConsoleMessage(messages.join(delimiter))
  }
};
