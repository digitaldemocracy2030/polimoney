FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Install Python and required system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    python3.10 \
    python3-pip \
    python3-venv \
    poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"

# Set working directory
WORKDIR /workspace

# Install global npm packages
RUN npm install -g npm@latest

# Create Python virtual environment
RUN python3 -m venv /workspace/.venv
ENV PATH="/workspace/.venv/bin:$PATH"
