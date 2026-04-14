/* about.js */

export const releaseNotes = `
Version 14 - What's new:

•  Add dynamic labels using $(command) substitution in names. For example, typing ---$(hostname) displays the hostname as a separator label. Feature contributed by Dylan M. Taylor.
•  Removed legacy migration code used to upgrade users to the v13 command storage schema (required for the increased number of commands).

Previous version:

•  Submenus! Adding * at the beginning of a command Name creates a submenu entry using the row above as the submenu title.
•  Added setting to reset all commands and extension settings to defaults.
•  Increased maximum number of entries from 30 to 99.
•  Improved internal settings handling by significantly reducing the required number of GSettings keys.
•  Added translations into Japanese, Chinese, Portuguese and Polish by IlCraccatore2011.
•  Support for GNOME 50.
`;
