import { readFile, writeFile, unlink } from 'node:fs/promises';

console.log("Loading Source File");

const rawData = await readFile('src/i18n/Client Translations.json', { encoding: 'utf8' });
const parsedData = JSON.parse(rawData);

const tabsName = Object.keys(parsedData);
const detectedLanguages = Object.keys(parsedData[tabsName[0]][Object.keys(parsedData[tabsName[0]])[0]]);

detectedLanguages.forEach(async language => {
    const messages = tabsName.reduce((acc, tabName) => {
        if (!(tabName in acc)) {
            acc[tabName] = {};
        }
        
        Object.keys(parsedData[tabName]).forEach(key => {
            if(key !== '') {
                acc[tabName][key] = parsedData[tabName][key][language];
            }
        });

        return acc;
    }, {});

    const fileContent = JSON.stringify(messages);
    await writeFile(`src/i18n/${language.toLocaleLowerCase()}.json`, fileContent);

    console.log(`File ${language} wrote successfully`);
});

// await unlink('src/i18n/Client Translations.json');
// console.log('Source file deleted successfully');