import chalk from "chalk";

export const success = (text: string): void => {
    console.log(chalk.bold.green("|SUCCESS| ") + text);
};

export const error = (text: string): void => {
    console.log(chalk.bold.red("|ERROR| ") + text);
};

export const info = (text: string): void => {
    console.log(chalk.bold.yellow("|INFO| ") + text);
};
