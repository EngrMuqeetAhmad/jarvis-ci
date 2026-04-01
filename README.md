# jarvis-ci

A lightweight Node.js-based CI/CD tool that executes YAML-defined pipelines on local machines or servers.

jarvis-ci is designed for simplicity, control, and self-hosted automation, similar in concept to GitHub Actions or GitLab CI, but running entirely under user-managed infrastructure.

for local machine , the user needs to configure the proxy URL from https://smee.io

https://www.npmjs.com/package/jarvis-ci

---

# Installation

```bash
npm install -g jarvis-ci
```

---

# Overview

jarvis-ci enables developers to define CI/CD workflows using a YAML configuration file and execute them via a webhook-driven system.

It supports:

* GitHub webhook-based triggers
* YAML-based pipeline definitions
* Local and server-based execution
* Working directory isolation per repository
* Restricted command execution for safety

For local development environments, webhook forwarding can be configured using a proxy service such as smee.io.

---

# Core Features

* YAML-driven pipeline execution
* GitHub webhook integration
* Multi-repository support
* Local and public server deployment modes
* Working directory isolation per pipeline
* Whitelisted command execution model
* Structured logging using Listr2

---

# Security Model

The system enforces a strict command whitelist to prevent arbitrary execution.

Allowed commands:

```ts
const ALLOWED_COMMANDS = [
  "node",
  "npm",
  "docker",
  "docker-compose",
  "ssh",
  "git"
];
```

Each pipeline is executed in an isolated working directory to prevent cross-repository contamination.

---

# Pipeline Configuration (YAML)

Each repository defines its pipeline using a `.jarvis.yml` file.

Example configuration:

```yaml
steps:
  - name: Install dependencies
    run:
      cmd: npm
      args: ["install"]

  - name: Run tests
    run:
      cmd: npm
      args: ["test"]
```

---

# CLI Commands

## Configuration

### Add repository configuration

```bash
jarvis config add
```

Adds a new repository configuration for CI execution.

---

### Set webhook port

```bash
jarvis config port
```

Defines the port on which the webhook server will run.

---

### Configure server mode

```bash
jarvis config local
```

Sets webhook server accessibility mode:

* `yes`: Localhost only
* `no`: Public IP accessible

---

### Configure proxy mode

```bash
jarvis config proxy
```

Enables webhook forwarding through smee.io for local development environments.

---

## Runtime

### Start webhook server

```bash
jarvis start
```

Starts the webhook listener and pipeline execution engine.

---

## Pipeline Management

### List pipelines

```bash
jarvis pipeline list
```

Displays all configured pipelines.

---

### Delete pipeline

```bash
jarvis pipeline delete <pipelineName>
```

Removes an existing pipeline configuration.

---

### Edit pipeline

```bash
jarvis pipeline edit <pipelineName>
```

Modifies an existing pipeline configuration.

---

# Execution Flow

The system operates as follows:

1. GitHub push event triggers webhook
2. Webhook server receives and validates event
3. Repository configuration is matched
4. Repository is cloned or updated in isolated directory
5. `.jarvis.yml` pipeline is loaded
6. Pipeline is validated against allowed commands
7. Steps are executed sequentially using Listr2
8. Each step runs in its isolated working directory using execa

---

# Architecture Components

* YAML parser for pipeline definitions
* Validation layer enforcing command restrictions
* Execution engine using execa for process control
* Task runner using Listr2 for structured output
* Webhook handler based on @octokit/webhooks
* Repository workspace isolation layer

---

# Development Mode (Local Setup)

For local environments, webhook events can be forwarded using a proxy such as smee.io.

This allows GitHub webhooks to reach a locally running jarvis-ci instance.

---

# Design Principles

* Minimal configuration overhead
* Deterministic pipeline execution
* Secure command execution model
* Isolation per repository workspace
* Predictable and traceable CI behavior

---

# Future Improvements

* Containerized execution per pipeline
* Parallel pipeline execution engine
* Artifact storage system
* Retry and failure policy system
* Plugin-based step extensions
* Remote dashboard for pipeline monitoring

---
