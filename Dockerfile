# syntax = docker/dockerfile:1
ARG BUN_VERSION=1.2.8
FROM oven/bun:${BUN_VERSION}


# Bun app lives here
WORKDIR /app

# # Set production environment
# ENV NODE_ENV=production

# Install packages needed to build node modules
RUN apt-get update -qq && \
  apt-get install -y python-is-python3 pkg-config build-essential 

# Install node modules
COPY --link bun.lockb package.json ./
RUN bun install --ci

# Copy application code
COPY . .

RUN bun tw

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "bun", "src/index.tsx" ]
