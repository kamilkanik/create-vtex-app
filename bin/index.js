#!/usr/bin/env node
const path = require('path');
const {input, checkbox} = require('@inquirer/prompts');
const {program} = require('commander');
const slugify = require('slugify')
const fs = require('fs-extra');
const ejs = require('ejs');

program
    .version('0.0.1')
    .description("Boot file generator for VTEX IO applications")
    .argument("[path]", "path to the application")
    .option('--name <name>', 'Name of the application')
    .option('--vendor <vendor>', 'Name of vendor')
    .option('--node', 'Use the node builder', false)
    .option('--react', 'Use the react builder', false)
    .option('--admin', 'Use the admin builder', false)
    .option('--graphql', 'Use the graphql builder', false)
    .option('--messages', 'Use the messages builder', false)
    .option('--store', 'Use the store builder', false)
    .option('--pixel', 'Use the pixel builder', false)
    .option('--masterdata', 'Use the masterdata builder', false)
    .parse(process.argv);

const cliOptions = program.opts();
const cliArgs = program.args;

async function gatherConfiguration() {
    const answers = {};

    if (!cliOptions.name) {
        answers.name = await input({
            message: 'Enter the name of the application: ',
            default: 'my-app',
        })
    }

    if (!cliOptions.vendor) {
        answers.vendor = await input({
            required: true,
            message: 'Enter the name of the application vendor: ',
        })
    }

    const builders = await checkbox({
        message: "Select the application builders you want to use: ",
        choices: [
            {
                name: "node",
                value: "node",
                description: "Node application builder with sample route",
                checked: cliOptions.node,
            },
            {
                name: "react",
                value: "react",
                description: "React application builder",
                checked: cliOptions.react,
            },
            {
                name: "admin",
                value: "admin",
                description: "Admin application builder with sample admin page",
                checked: cliOptions.admin,
            },
            {
                name: "graphql",
                value: "graphql",
                description: "GraphQL application builder with sample resolvers",
                checked: cliOptions.graphql,
            },
            {
                name: "messages",
                value: "messages",
                description: "Messages application builder for translations",
                checked: cliOptions.messages,
            },
            {
                name: "masterdata",
                value: "masterdata",
                description: "Masterdata application builder with sample data entity",
                checked: cliOptions.masterdata,
            },
            {
                name: "pixel",
                value: "pixel",
                description: "Pixel application builder",
                checked: cliOptions.pixel,
            },
            {
                name: "store",
                value: "store",
                description: "Store application builder",
                checked: cliOptions.store,
            }
        ],
        validate: (choices) => {
            if (!choices || !choices.length) {
                return 'You must select at least one of the builders.'
            }

            return true;
        },
    })

    return {
        appName: answers.name,
        appSlug: slugify(answers.name).toLowerCase(),
        vendor: cliOptions.vendor || answers.vendor,
        node: builders.find(builderName => builderName === "node") || false,
        react: builders.find(builderName => builderName === "react") || false,
        admin: builders.find(builderName => builderName === "admin") || false,
        graphql: builders.find(builderName => builderName === "graphql") || false,
        messages: builders.find(builderName => builderName === "messages") || false,
        masterdata: builders.find(builderName => builderName === "masterdata") || false,
        pixel: builders.find(builderName => builderName === "pixel") || false,
        store: builders.find(builderName => builderName === "store") || false,
    };
}

async function generateProject() {
    const options = await gatherConfiguration();
    const projectPath = path.join(process.cwd(), cliArgs[0] ? slugify(cliArgs[0]) : options.appSlug);

    try {
        await fs.ensureDir(projectPath);
        await createMainFiles(projectPath, options);
        if (options.node) {
            await addNode(projectPath, options)
        }
        if (options.react) {
            await addReact(projectPath, options)
        }
        if (options.admin) {
            await addAdmin(projectPath, options)
        }
        if (options.graphql) {
            await addGraphQL(projectPath, options)
        }
        if (options.messages) {
            await addMessages(projectPath, options)
        }
        if (options.masterdata) {
            await addMasterData(projectPath, options)
        }
        if(options.pixel){
            await addPixel(projectPath, options)
        }

        console.log("\x1b[32mProject generated successfully!\x1b[0m");
    } catch (err) {
        console.error('Error while generating the project: ', err);
    }
}

async function createMainFiles(projectPath, options) {
    const templatePath = path.join(__dirname, '../templates', "main");
    await copyTemplate(templatePath, projectPath, options);

    const manifestPath = path.join(projectPath, 'manifest.json');
    const manifestJson = await fs.readJson(manifestPath);

    manifestJson.name = options.appSlug;
    manifestJson.vendor = options.vendor;
    manifestJson.title = options.appName;

    manifestJson.builders = {
        ...manifestJson.builders,
        ...(options.node && {node: "7.x"}),
        ...(options.react && {react: "3.x"}),
        ...(options.admin && {admin: "0.x", react: "3.x"}),
        ...(options.messages && {messages: "1.x"}),
        ...(options.store && {store: "0.x", react: "3.x"}),
        ...(options.masterdata && {masterdata: "1.x"}),
        ...(options.graphql && {graphql: "1.x"}),
        ...(options.pixel && {pixel: "0.x", react: "3.x", store: "0.x"}),
    };

    await fs.writeJson(manifestPath, manifestJson, {spaces: 2});
}

async function addNode(projectPath, options) {
    const nodeTemplatePath = path.join(__dirname, '../templates', "node");
    const nodeDirectoryPath = path.join(projectPath, 'node');
    await fs.ensureDir(nodeDirectoryPath);
    await copyTemplate(nodeTemplatePath, nodeDirectoryPath, options);
}

async function addReact(projectPath, options) {
    const reactTemplatePath = path.join(__dirname, '../templates', "react");
    const reactDirectoryPath = path.join(projectPath, 'react');
    await fs.ensureDir(reactDirectoryPath);
    await copyTemplate(reactTemplatePath, reactDirectoryPath, options);
}

async function addAdmin(projectPath, options) {
    const adminTemplatePath = path.join(__dirname, '../templates', "admin");
    const adminDirectoryTemplatePath = path.join(adminTemplatePath, 'admin');
    const reactDirectoryTemplatePath = path.join(adminTemplatePath, 'react');
    const adminDirectoryPath = path.join(projectPath, 'admin');
    const reactDirectoryPath = path.join(projectPath, "react");

    await fs.ensureDir(adminDirectoryPath)
    await fs.ensureDir(reactDirectoryPath);

    await copyTemplate(adminDirectoryTemplatePath, adminDirectoryPath, options);
    await copyTemplate(reactDirectoryTemplatePath, reactDirectoryPath, options);
}

async function addGraphQL(projectPath, options) {
    const graphqlTemplatePath = path.join(__dirname, '../templates', "graphql");
    const graphqlDirectoryTemplatePath = path.join(graphqlTemplatePath, 'graphql');
    const nodeDirectoryTemplatePath = path.join(graphqlTemplatePath, 'node');
    const reactDirectoryTemplatePath = path.join(graphqlTemplatePath, 'react');

    const graphqlDirectoryPath = path.join(projectPath, 'graphql');
    const nodeDirectoryPath = path.join(projectPath, 'node');
    const reactDirectoryPath = path.join(projectPath, "react");

    await fs.ensureDir(graphqlDirectoryPath);
    await fs.ensureDir(nodeDirectoryPath);
    await fs.ensureDir(reactDirectoryPath);

    await copyTemplate(graphqlDirectoryTemplatePath, graphqlDirectoryPath, options);
    await copyTemplate(nodeDirectoryTemplatePath, nodeDirectoryPath, options);
    await copyTemplate(reactDirectoryTemplatePath, reactDirectoryPath, options);
}

async function addMessages(projectPath, options) {
    const messagesTemplatePath = path.join(__dirname, '../templates', "messages");
    const messagesDirectoryPath = path.join(projectPath, 'messages');

    await fs.ensureDir(messagesDirectoryPath);
    await copyTemplate(messagesTemplatePath, messagesDirectoryPath, options);
}

async function addMasterData(projectPath, options) {
    const masterdataTemplatePath = path.join(__dirname, '../templates', "masterdata");
    const masterdataDirectoryPath = path.join(projectPath, 'masterdata');

    await fs.ensureDir(masterdataDirectoryPath);
    await copyTemplate(masterdataTemplatePath, masterdataDirectoryPath, options);
}

async function addPixel(projectPath, options) {
    const pixelTemplatePath = path.join(__dirname, '../templates', "pixel");
    const reactDirectoryTemplatePath = path.join(pixelTemplatePath, 'react');
    const storeDirectoryTemplatePath = path.join(pixelTemplatePath, 'store');

    const reactDirectoryPath = path.join(projectPath, "react");
    const storeDirectoryPath = path.join(projectPath, "store");

    await fs.ensureDir(reactDirectoryPath);
    await fs.ensureDir(storeDirectoryPath);

    await copyTemplate(reactDirectoryTemplatePath, reactDirectoryPath, options);
    await copyTemplate(storeDirectoryTemplatePath, storeDirectoryPath, options);
}

async function copyTemplate(src, dest, options) {
    const files = await fs.readdir(src);
    for (const file of files) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file.replace('.ejs', ''));
        const stats = await fs.stat(srcPath);

        if (stats.isDirectory()) {
            await fs.ensureDir(destPath);
            await copyTemplate(srcPath, destPath, options);
        } else {
            const templateContent = await fs.readFile(srcPath, 'utf-8');
            const renderedContent = await ejs.render(templateContent, options);
            await fs.writeFile(destPath, renderedContent);
        }
    }
}

generateProject();
