# CAVISE Pipelines

Reusable GitHub Actions workflows and actions shared by CAVISE repositories.

## Contract

Reusable workflows accept only predefined typed inputs. They must not accept shell scripts, arbitrary commands, arbitrary command-line arguments, or environment export blocks from consumer repositories.

## Generic Python Workflows

- `.github/workflows/python-black.yml` runs `black --check --diff` with a pinned Black version.
- `.github/workflows/python-pytest.yml` runs pytest, optional protobuf generation, optional JUnit upload.
- `.github/workflows/python-ruff.yml` runs `ruff check` and/or `ruff format --check --diff`.
- `.github/workflows/python-mypy.yml` installs mypy tooling, optionally generates protobuf modules, and runs mypy.
- `.github/workflows/python-cmake-cuda.yml` builds CMake CUDA extensions, validates the generated artifact manifest, and optionally imports installed Python modules.
- `.github/workflows/python-deadcode.yml` installs and runs deadcode.
- `.github/workflows/python-pre-commit.yml` runs pre-commit with a controlled `--all-files` flag and optional `SKIP` hook list.

## Generic C++ Workflows

- `.github/workflows/cpp-clang-format.yml` runs a Meson project's `clang-format-check` target inside a caller-provided GHCR image.
- `.github/workflows/cpp-meson-clang-tidy.yml` builds a Meson project inside a caller-provided GHCR image, optionally prepares ns-3, and runs Meson's `clang-tidy` target.

The caller must grant `packages: read` to `GITHUB_TOKEN`. The container image must provide Bash, Git, a C++ compiler, Meson, Ninja, the requested Clang tool, and the project's build dependencies.

## Composite Actions

- `actions/setup-python-pip` sets up Python, enables pip cache, upgrades pip, and optionally installs a requirements file.
- `actions/generate-protobufs` generates Python protobuf modules using `protoc`, `grpc_tools.protoc`, or named CMake presets.

Child repositories should keep their own trigger and composition files, then call these reusable workflows with `jobs.<job_id>.uses`.

Before publishing a stable release, internal action references in workflows should be pinned to the same release tag, for example `@v1`.
