# Header Rule Template

This file fixes the canonical English header template for project entry/source files.

## Canonical Template

Use the following five lines at the top of each entry/source file, with comment syntax adjusted to the file type and relative paths adjusted to the repository root:

```text
read ../AGENTS.md and ../README.md before editing this file;
then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
Before a new coding round, ask whether it extends the previous coding;
if not, ask whether to forget/compress context first.
Do not continue reading past this point until the loop above has been completed
```

## Enforcement

- This template is no longer limited to “key entry files”.
- The default enforcement scope is all real entry/source files inside the project.
- Repository enforcement scripts should validate the fixed English wording, not only the existence of a generic marker.
