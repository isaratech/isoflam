# Use Node.js LTS as the base image
FROM node:20

# Set the working directory
WORKDIR /workspace

# Install git and sudo, useful for version control and permissions
RUN apt-get update && apt-get install -y git sudo

# Configure sudo for node user
RUN echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node && \
    chmod 0440 /etc/sudoers.d/node

# Install global npm packages
RUN npm install -g npm@latest

# The command that will be run when the container starts
CMD ["sleep", "infinity"]
