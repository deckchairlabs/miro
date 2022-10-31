# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.209.6/containers/rust/.devcontainer/base.Dockerfile

# [Choice] Debian OS version (use bullseye on local arm64/Apple Silicon): buster, bullseye
ARG VARIANT="bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/rust:0-${VARIANT}

# [Optional] Uncomment this section to install additional packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends binaryen

ENV DENO_INSTALL=/deno
ENV DENO_VERSION=v1.27.0

RUN mkdir -p /deno \
    && curl -fsSL https://deno.land/x/install/install.sh | sh -s ${DENO_VERSION} \
    && chown -R vscode /deno

ENV PATH=${DENO_INSTALL}/bin:${PATH} \
    DENO_DIR=${DENO_INSTALL}/.cache/deno

USER vscode

RUN deno install --allow-read --allow-write --allow-run -f -n publish https://deno.land/x/publish@v1.15.0/cli.ts
ENV PATH="/home/vscode/.deno/bin:$PATH"