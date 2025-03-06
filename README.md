# Create VTEX App

> **[!NOTE]** Create VTEX App is a CLI tool for scaffolding VTEX applications quickly and efficiently.

Create VTEX apps with no manual configuration required.

- [Creating an App](#creating-an-app) – How to create a new VTEX app.

Create VTEX App works on macOS, Windows, and Linux. If something doesn’t work, please [file an issue](https://github.com/kamilkanik/create-vtex-app/issues/new).

## Quick Overview

```sh
npx create-vtex-app my-app
```

### Get Started Immediately

You **don’t** need to configure tools manually. They are preconfigured so that you can focus on the code.

Create a project, and you’re good to go.

## Creating an App

**You’ll need to have Node.js v18.0.0 or later on your local development machine.**

To create a new app, use the following method:

### npx

```sh
npx create-vtex-app my-app
```

It will create a directory called `my-app` inside the current folder. Inside that directory, it will generate the initial project structure.

Once the installation is done, you can open your project folder:

```sh
cd my-app
```

Inside the newly created project, you can run some vtex cli commands:

### `vtex setup --all`

Sets up all available typings, configs, and tools.

### `vtex link`

Syncs the app in the current directory with the development workspace in use.


## What’s Included?

- Preconfigured VTEX app structure
- Admin panel integration
- Pixel event tracking
- GraphQL API setup
- Storefront integration

## License

Create VTEX App is open-source software [licensed under MIT](https://github.com/kamilkanik/create-vtex-app/blob/main/LICENSE).

