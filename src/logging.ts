import chalk from "chalk";

export const success = (text: string) => {
    console.log(chalk.bold.green("|SUCCESS| ") + text);
};

export const error = (text: string) => {
    console.log(chalk.bold.red("|ERROR| ") + text);
};

export const info = (text: string) => {
    console.log(chalk.bold.yellow("|INFO| ") + text);
};
