# DevContainer for Polimoney

This directory contains configuration files for setting up a consistent development environment using Visual Studio Code's DevContainer feature.

## What's Included

- **Node.js**: Latest LTS version for Next.js development
- **Python 3.10**: For the Python tools in the `tools` directory
- **Poetry**: For Python dependency management
- **VS Code Extensions**: Pre-configured extensions for JavaScript/TypeScript and Python development

## Requirements

To use this DevContainer, you need:

1. [Visual Studio Code](https://code.visualstudio.com/)
2. [Docker](https://www.docker.com/products/docker-desktop)
3. [VS Code Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Getting Started

1. Open this project in VS Code
2. When prompted, click "Reopen in Container" or run the "Remote-Containers: Reopen in Container" command from the Command Palette (F1)
3. VS Code will build the container and set up the development environment (this may take a few minutes the first time)
4. Once the container is built, you can:
   - Run `npm run dev` to start the Next.js development server
   - Work with the Python tools in the `tools` directory using Poetry

## How to Launch the DevContainer

There are several ways to launch the DevContainer:

1. **Using the Command Palette**:
   - Press `F1` or `Ctrl+Shift+P` (Windows/Linux) / `Cmd+Shift+P` (Mac)
   - Type "Remote-Containers: Reopen in Container" and select it

2. **Using the Remote Status Bar**:
   - Click on the green "><" icon in the bottom-left corner of VS Code
   - Select "Reopen in Container" from the menu

3. **Using the Notification**:
   - When you open a project with a DevContainer configuration, VS Code will show a notification
   - Click "Reopen in Container" in the notification

4. **From the Explorer View**:
   - Right-click on the `.devcontainer` folder in the Explorer
   - Select "Reopen in Container" from the context menu

## Customizing the DevContainer

If you need to customize the development environment:

- Modify `Dockerfile` to change the container setup
- Update `devcontainer.json` to change VS Code settings or add extensions
- After making changes, rebuild the container using the "Remote-Containers: Rebuild Container" command

## Troubleshooting

- If you encounter issues with Node.js dependencies, try running `npm install` inside the container
- For Python dependency issues, run `cd tools && poetry install` inside the container
- If the container fails to build, check Docker logs for more detailed error messages
