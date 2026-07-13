<!-- changelog.md -->

## Version 15 (not yet released)

**New Features**

- Use special command ##ShowApplications to open application overview. Feature contributed by Dylan M. Taylor.

**Improvements**

- Improved translation support and updated translations by IlCraccatore2011.
- Fixed menu icon update and reset issues affecting Bluefin/Dakota.

## Version 14 (2026-05-02)

**New Features**

- Added dynamic labels using $(command) substitution in names. For example, typing ---$(hostname) displays the hostname as a separator label. Feature contributed by Dylan M. Taylor.

**Improvements**

- Removed legacy migration code used to upgrade users to the v13 command storage schema (required for the increased number of commands).

## Version 13 (2026-02-18)

**New Features**

- Added support for Submenus. Adding * at the beginning of a command Name creates a submenu entry using the row above as the submenu title.
- Added setting to reset all commands and extension settings to defaults.
- Added translations into Japanese, Chinese, Portuguese and Polish by IlCraccatore2011.
- Support added for GNOME 50

**Improvements**

- Increased maximum number of entries from 30 to 99.
- Improved internal settings handling by significantly reducing the required number of GSettings keys.

## Version 12 (2025-10-02)

**New Features**

- Translations into Italian, Russian, Spanish, French, and German by IlCraccatore2011.

**Improvements**

- Modified the Menu Type setting for improved translation support.

## Version 11 (2025-09-02)

**New Features**

- Option to customize menu location in the top bar.
- Support added for GNOME 49.

## Version 10 (2025-06-28)

**New Features**

- Typing --- or ~~~ in the name field creates a separator line in the menu.
- Adding text after --- or ~~~ creates a labeled separator.
- An "Insert new" option was added to the row menu (alongside "Duplicate" and "Delete") to insert a new row below an existing one.
- A maximize button was added to the preferences window, and the default window size has been changed to better suit a list of commands.

**Improvements**

- Fixed a bug where dragging and dropping a row to the same location caused it to jump to the top or bottom of the list.
- Fixed a bug where dragging and dropping or deleting a row sometimes caused the view to scroll to a different location.
- Fixed a bug where the row menu sometimes didn't register a selection.
- A notification will now appear when the maximum number of command rows is reached.

## Version 9 (2025-05-31)

**New Features**

- Redesigned user interface for configuring commands.
- Drag-and-drop support to reorder commands.
- Checkbox option to show or hide commands in the drop-down menu.
- Add and delete commands as needed instead of showing blank rows in the UI.
- Option to duplicate existing command entries.

**Improvements**

- Increased maximum number of supported commands to 30.

## Version 8 (2025-04-18)

**Improvements**

- Updated icons for compatibility with GNOME 48.
- Improved code readability.

## Version 7 (2025-01-29)

**New Features**

- Support added for GNOME 48.

**Improvements**

- Fixed a compatibility issue with some systems (such as NixOS) by switching from /bin/bash to /usr/bin/env bash for command execution.

## Version 6 (2024-11-08)

**New Features**

- Option to use custom text or a custom icon for the menu title instead of the default "Commands" text.
- Open button added to pop-up notification after exporting commands to directly open/edit the commands.ini file.

## Version 5 (2024-09-07)

**New Features**

- Backup and Restore section added to user preferences.
- Export list of commands to an editable commands.ini file.
- Import list of commands from the commands.ini file.
- Support added for GNOME 47.

**Improvements**

- Code revisions to improve efficiency.

## Version 4 (2024-07-21)

**Improvements**

- Increased maximum number of supported commands to 20.
- UI improvements.