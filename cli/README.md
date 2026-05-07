# Deployify CLI 🚀

The official Command Line Interface for [Deployify](https://deployify.vercel.app). Deploy your static websites instantly from your terminal.

## Installation

You can run Deployify directly using `npx`:

```bash
npx deployify-cli-official <command>
```

Or install it globally:

```bash
npm install -g deployify-cli-official
```

## Quick Start

### 1. Login
Authenticate your CLI with your Deployify account using your API Key (found in your Settings page).

```bash
deployify login <your-api-key>
```

### 2. Initialize
Prepare your project for deployment. This will create a `deployify.json` config file in your current directory.

```bash
deployify init "My Awesome Project" "my-project-slug"
```

### 3. Deploy
Upload your current directory to Deployify.

```bash
deployify deploy
```

## Commands

| Command | Description |
| --- | --- |
| `login <key>` | Authenticate the CLI with your personal API Key. |
| `init <name> <slug>` | Initialize a new project with a name and URL slug. |
| `deploy` | Zip and upload the current directory to the edge. |

## License

MIT © [Deployify](https://deployify.vercel.app)
