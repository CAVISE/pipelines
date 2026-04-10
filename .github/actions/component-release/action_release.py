import os
import re
import subprocess
from pathlib import Path
from datetime import date


def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, text=True, capture_output=True)
    if result.returncode != 0:
        print(f"Error '{cmd}':\n{result.stderr}")
        exit(1)
    return result.stdout.strip()


def get_latest_tag():
    try:
        tag = run_cmd("gh release view --json tagName -q .tagName")
        return tag if tag else "v0.0.0"
    except Exception:
        return "v0.0.0"


def bump_version(latest_tag, pr_title):
    match = re.match(r"v?(\d+)\.(\d+)\.(\d+)", latest_tag)
    major, minor, patch = map(int, match.groups()) if match else (0, 0, 0)

    title = pr_title.lower()
    if "[major]" in title:
        major += 1
        minor = 0
        patch = 0
    elif "[minor]" in title:
        minor += 1
        patch = 0
    elif "[patch]" in title:
        patch += 1
    else:
        print("[patch], [minor] or [major] not found. Skip.")
        exit(0)

    return f"v{major}.{minor}.{patch}"


def collect_news():
    news_dir = Path(".news")
    changelog = []
    if news_dir.exists() and news_dir.is_dir():
        for file in news_dir.glob("*.md"):
            content = file.read_text(encoding="utf-8").strip()
            lines = content.splitlines()
            if lines:
                entry = f"- {lines[0]}"
                for line in lines[1:]:
                    entry += f"\n  {line}"
                changelog.append(entry)
            file.unlink()
            run_cmd(f"git rm {file.as_posix()}")
    return "\n".join(changelog) if changelog else "- No significant changes."


def update_changelog(new_version, news_content):
    changelog_file = Path("CHANGELOG.md")
    header = f"## [{new_version}] - {date.today()}"
    new_block = f"{header}\n{news_content}\n\n"

    if changelog_file.exists():
        existing = changelog_file.read_text(encoding="utf-8")
        if existing.startswith("# Changelog"):
            updated = existing.replace("# Changelog", f"# Changelog\n\n{new_block}", 1)
        else:
            updated = f"# Changelog\n\n{new_block}{existing}"
    else:
        updated = f"# Changelog\n\n{new_block}"

    changelog_file.write_text(updated, encoding="utf-8")


def extract_release_notes(latest_tag):
    changelog = Path("CHANGELOG.md").read_text(encoding="utf-8")
    pattern = re.compile(rf"(## \[.*?\] - .*?)(?=## \[{latest_tag}\]|$)", re.DOTALL)
    match = pattern.search(changelog)
    return match.group(1).strip() if match else "No release notes found."


def main():
    pr_title = os.getenv("PR_TITLE", "")
    title_lower = pr_title.lower()
    latest_tag = get_latest_tag()
    new_version = bump_version(latest_tag, pr_title)
    is_tag_release = "[tag]" in title_lower

    print(f"Current tag: {latest_tag} | New version: {new_version}")

    news = collect_news()
    update_changelog(new_version, news)

    status = run_cmd("git status --porcelain")

    if status:
        run_cmd("git config user.name 'github-actions[bot]'")
        run_cmd("git config user.email 'github-actions[bot]@users.noreply.github.com'")
        run_cmd("git add CHANGELOG.md")
        run_cmd(f"git commit -m 'chore: update changelog for {new_version}'")
        run_cmd("git push")

    if is_tag_release:
        print(f"Release tag {new_version}.")
        release_notes = extract_release_notes(latest_tag)

        notes_file = Path("release_notes_tmp.md")
        notes_file.write_text(release_notes, encoding="utf-8")

        run_cmd(f"git tag {new_version}")
        run_cmd(f"git push origin {new_version}")
        run_cmd(f"gh release create {new_version} -F {notes_file.as_posix()} -t 'Release {new_version}'")
        notes_file.unlink()
        print(f"Release {new_version} successfully uploaded!")
    else:
        print("Tag [tag] not found. Changelog updated, release delayed.")


if __name__ == "__main__":
    main()
