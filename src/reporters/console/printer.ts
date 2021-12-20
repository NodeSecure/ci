import kleur from "kleur";

type ConsoleMessage = {
  message: string;
  underline: () => ConsoleMessage;
  italic: () => ConsoleMessage;
  bold: () => ConsoleMessage;
  print: () => void;
};

type ConsoleOutput<I, O = string> = (message: I) => O;

type ConsolePrinter = {
  font: {
    standard: ConsoleOutput<string, ConsoleMessage>;
    highlight: ConsoleOutput<string, ConsoleMessage>;
    info: ConsoleOutput<string, ConsoleMessage>;
    error: ConsoleOutput<string, ConsoleMessage>;
    success: ConsoleOutput<string, ConsoleMessage>;
    failure: ConsoleOutput<string, ConsoleMessage>;
  };
  decoration: {
    bold: ConsoleOutput<string>;
    underline: ConsoleOutput<string>;
    italic: ConsoleOutput<string>;
  };
  util: {
    concatOutputs: ConsoleOutput<string[], ConsoleMessage>;
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
    standard: (message: string) => createConsoleMessage(kleur.dim(message)),
    highlight: (message: string) => createConsoleMessage(kleur.magenta(message)),
    info: (message: string) => createConsoleMessage(kleur.yellow(message)),
    error: (message: string) => createConsoleMessage(kleur.red(message)),
    success: (message: string) => createConsoleMessage(kleur.bgGreen().white(message)),
    failure: (message: string) => createConsoleMessage(kleur.bgRed().white(message))
  },
  decoration: {
    underline: (message: string) => kleur.underline(message),
    italic: (message: string) => kleur.italic(message),
    bold: (message: string) => kleur.bold(message)
  },
  util: {
    concatOutputs: (messages: string[], delimiter = " ") => createConsoleMessage(messages.join(delimiter))
  }
};
