#!/usr/bin/env bash

language_list="${LANGUAGES//[[:space:]]/}"

IFS=',' read -r -a raw_languages <<< "$language_list"
languages=()
seen_languages=","
default_language_requested=false

for language in "${raw_languages[@]}"; do
  if [[ "$seen_languages" == *",$language,"* ]]; then
    echo "languages contains the duplicate language code '$language'." >&2
    exit 1
  fi

  seen_languages+="$language,"
  languages+=("$language")

  if [[ "$language" == "$DEFAULT_LANGUAGE" ]]; then
    default_language_requested=true
  fi
done

if [[ "$default_language_requested" != true ]]; then
  echo "default-language '$DEFAULT_LANGUAGE' must be included in languages '$LANGUAGES'." >&2
  exit 1
fi

site_directory="${BUILD_DIRECTORY%/}/html"

build_language() {
  local language="$1"
  local output_directory="$site_directory"

  if [[ "$language" != "$DEFAULT_LANGUAGE" ]]; then
    output_directory="$site_directory/$language"
  fi

  echo "::group::Build documentation language '$language' into '$output_directory'"
  DOCS_LANGUAGE="$language" \
    DOCS_LANGUAGES="$language_list" \
    DOCS_DEFAULT_LANGUAGE="$DEFAULT_LANGUAGE" \
    python -m sphinx \
    -b html \
    -D "language=$language" \
    "$SOURCE_DIRECTORY" \
    "$output_directory"
  echo "::endgroup::"
}

build_language "$DEFAULT_LANGUAGE"

for language in "${languages[@]}"; do
  if [[ "$language" != "$DEFAULT_LANGUAGE" ]]; then
    build_language "$language"
  fi
done
