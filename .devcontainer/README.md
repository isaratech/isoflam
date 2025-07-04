# Development Container for Isoflam

This directory contains configuration files for setting up a development container for the Isoflam project.

## What is a Development Container?

A development container (or devcontainer) is a Docker container specifically configured for development purposes. It provides a consistent, isolated environment with all the necessary tools and dependencies pre-installed.

## Features

- Node.js 20 (LTS)
- Git for version control
- Latest npm
- VS Code extensions for TypeScript, React, ESLint, and Prettier
- Automatic code formatting and linting

## How to Use

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Opening the Project in a Devcontainer

1. Open VS Code
2. Open the Isoflam project folder
3. When prompted, click "Reopen in Container"
   - Alternatively, press F1, type "Remote-Containers: Reopen in Container", and press Enter

VS Code will build the Docker container and connect to it. This may take a few minutes the first time.

### Development Workflow

Once the container is running:

1. Open a terminal in VS Code (Terminal > New Terminal)
2. Run `npm start` to start the development server
3. Access the application at http://localhost:8080

## Customization

You can customize the devcontainer by modifying:

- `Dockerfile`: Change the base image or install additional system packages
- `docker-compose.yml`: Configure container services, volumes, ports, and environment variables
- `devcontainer.json`: Adjust VS Code settings, extensions, or container configuration

## Architecture

This devcontainer uses Docker Compose to set up the development environment:

1. `docker-compose.yml` defines the container service configuration
2. `Dockerfile` specifies how to build the development container
3. `devcontainer.json` configures VS Code's interaction with the container
