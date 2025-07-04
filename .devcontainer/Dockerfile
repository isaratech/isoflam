# Use Node.js LTS as the base image
FROM node:20

# Set the working directory
WORKDIR /workspace

# Install git, useful for version control
RUN apt-get update && apt-get install -y git

# Install global npm packages
RUN npm install -g npm@latest

# The command that will be run when the container starts
CMD ["sleep", "infinity"]