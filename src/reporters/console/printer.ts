import kleur from "kleur";

function createConsoleMessage(message: string) {
    return {
        message,
        // TODO : Use a better way to manage CLI UI
        print: () => console.log(`${message} \n`)
    };
}

export const consolePrinter = {
    standard: (message: string) => createConsoleMessage(kleur.bold().blue(message)),
    info: (message: string) => createConsoleMessage(kleur.bold().yellow(message)),
    error: (message: string) => createConsoleMessage(kleur.bold().red(message)),
    success: (message: string) => createConsoleMessage(kleur.bgGreen().bold().white(message)),
    failure: (message: string) => createConsoleMessage(kleur.bgRed().bold().white(message)),
    concatMessages: (...messages: string[]) => createConsoleMessage(messages.join(" "))
};


export function millisecondsToSeconds(ms: number, asString = true): number | string {
    const seconds = (ms / 1000).toFixed(2);
    if (asString) {
        return `${seconds}s`;
    }

    return seconds;
}
