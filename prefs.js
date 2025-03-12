/* prefs.js
 *
 * This file is part of the Custom Command Menu GNOME Shell extension
 * https://github.com/StorageB/custom-command-menu
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import {releaseNotes} from './about.js';

let numberOfCommands = 20;
let fileName = 'commands.ini';
let filePath = GLib.build_filenamev([GLib.get_home_dir(), fileName]);

export default class CustomCommandListPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage({
            title: _('Commands'),
            icon_name: 'utilities-terminal-symbolic',
        });
        window.add(page);

        
        //#region Command List
        const group0 = new Adw.PreferencesGroup({
            title: _('Command List'),
        });
        page.add(group0);

        // Create groups and entry rows for commands
        for (let i = 1; i <= numberOfCommands; i++) {
            const group = new Adw.PreferencesGroup({});
            page.add(group);

            const expanderRow = new Adw.ExpanderRow({
                title: '',
                subtitle: '',
                expanded: false,
                //show_enable_switch: true,
            });
            const entryrowA = new Adw.EntryRow({
                title: _('Name:'),
            });
            const entryrowB = new Adw.EntryRow({
                title: _('Command:'),
            });
            const entryrowC = new Adw.EntryRow({
                title: _('Icon:'),
            });

            group.add(expanderRow);
            expanderRow.add_row(entryrowA);
            expanderRow.add_row(entryrowB);
            expanderRow.add_row(entryrowC);
            
            // Bind settings 
            window._settings = this.getSettings();
            window._settings.bind(`entryrow${i}a-setting`, entryrowA, 'text', Gio.SettingsBindFlags.DEFAULT);
            window._settings.bind(`entryrow${i}b-setting`, entryrowB, 'text', Gio.SettingsBindFlags.DEFAULT);
            window._settings.bind(`entryrow${i}c-setting`, entryrowC, 'text', Gio.SettingsBindFlags.DEFAULT);

            // Connect signals to update title and subtitle of ExpanderRow
            entryrowA.connect('notify::text', () => {
                expanderRow.title = entryrowA.text.replace(/&/g, '&amp;');
                expanderRow.subtitle = (entryrowA.text === '' && entryrowB.text === '') ? (`(${i})`) : entryrowB.text.replace(/&/g, '&amp;');
            });
            entryrowB.connect('notify::text', () => {
                expanderRow.subtitle = (entryrowA.text === '' && entryrowB.text === '') ? (`(${i})`) : entryrowB.text.replace(/&/g, '&amp;');
            });

            // Initialize title and subtitle
            entryrowA.notify('text');
            entryrowB.notify('text');
        }
        //#endregion Command List


        const page2 = new Adw.PreferencesPage({
            title: _('Configuration'),
            icon_name: 'applications-system-symbolic',
        });
        window.add(page2);

        const backupGroup1 = new Adw.PreferencesGroup({
            title: _('Backup and Restore'),
        });

        //#region Export 
        const exportRow = new Adw.ActionRow({
            title: _('Export Command List'),
            subtitle: _(`Click to export ${fileName} configuration file to user's home directory`),
            activatable: true,
        });
        exportRow.add_prefix(new Gtk.Image({icon_name: 'x-office-document-symbolic'}));
        
        exportRow.connect('activated', () => {
            let keyFile = new GLib.KeyFile();
        
            // Loop through command entries and write them to the keyfile
            for (let i = 1; i <= numberOfCommands; i++) {
                let name = window._settings.get_string(`entryrow${i}a-setting`);
                let command = window._settings.get_string(`entryrow${i}b-setting`);
                let icon = window._settings.get_string(`entryrow${i}c-setting`);
                // Only write commands that are not blank
                if (name !== '' || command !== '' || icon !== '') {
                    keyFile.set_string(`Command ${i}`, 'Name', name);
                    keyFile.set_string(`Command ${i}`, 'Command', command);
                    keyFile.set_string(`Command ${i}`, 'Icon', icon);
                }
            }        
        
            // Try saving the config file
            try {
                keyFile.save_to_file(filePath);
                console.log(`[Custom Command Menu] Commands exported to ${filePath}`);
                const toast = Adw.Toast.new(_(`Commands exported to: ${filePath}`));
                toast.set_timeout(3);
                toast.set_button_label(_('Open'));
                toast.connect('button-clicked', () => {
                    // Determine if there is a default text editor available and open the saved file
                    let appInfo = Gio.AppInfo.get_default_for_type('text/plain', false);
                    if (appInfo) {
                        appInfo.launch_uris([`file://${filePath}`], null);
                    } else {
                        const noAppDialog = new Gtk.MessageDialog({
                            transient_for: window,
                            modal: true,
                            text: _('Application Not Found'),
                            secondary_text: _
                                ('No default application found to open .ini files.\n\n' +
                                 'The commands.ini configuration file can be opened and modified in any text editor. ' +
                                 'To open the file, it may first be required to manually associate the .ini file ' +
                                 'with the default text editor by doing the following:\n\n' +
                                 '1. Open the home directory and locate the commands.ini file\n' +
                                 '2. Right-click on the file and select "Open with..."\n' +
                                 '3. Choose a default text editor, and select the option "Always use for this file type"'
                                ),
                            buttons: Gtk.ButtonsType.CLOSE,
                        });
                        noAppDialog.connect('response', () => noAppDialog.destroy());
                        noAppDialog.show();
                    }
                });
                window.add_toast(toast);
            } catch (e) {
                console.log(`[Custom Command Menu] Failed to export commands\n${e}`);
                const toast = Adw.Toast.new(_(`Export Error`));
                toast.set_timeout(3);
                toast.set_button_label(_('Details'));
                toast.connect('button-clicked', () => {
                    let errorDialog = new Adw.MessageDialog({
                        transient_for: window,
                        modal: true,
                        heading: _('Export Error'),
                        body: _(`Failed to export command list\n\n${e}`),
                    });
                    errorDialog.add_response('ok', _('OK'));
                    errorDialog.connect('response', () => errorDialog.destroy());
                    errorDialog.show();
                });
                window.add_toast(toast);
            }
        });
        //#endregion Export
        

        //#region Import
        const importRow = new Adw.ActionRow({
            title: _('Import Command List'),
            subtitle: _(`Click to import ${fileName} configuration file from user's home directory`),
            activatable: true,
        });
        importRow.add_prefix(new Gtk.Image({icon_name: 'x-office-document-symbolic'}));

        importRow.connect('activated', () => {
            let filePath = GLib.build_filenamev([GLib.get_home_dir(), fileName]);
            let keyFile = new GLib.KeyFile();
        
            // Check if the file exists
            if (!GLib.file_test(filePath, GLib.FileTest.EXISTS)) {
                const toast = Adw.Toast.new(_(`File not found`));
                toast.set_timeout(3);
                toast.set_button_label(_('Details'));
                toast.connect('button-clicked', () => {
                    let errorDialog = new Adw.MessageDialog({
                        transient_for: window,
                        modal: true,
                        heading: _('File Not Found'),
                        body: _(`The ${fileName} configuration file could not be found in the user's home directory. ` +
                            `Verify the following file exists:\n\n` +
                            `${filePath}`),
                    });
                    errorDialog.add_response('ok', _('OK'));
                    errorDialog.connect('response', () => errorDialog.destroy());
                    errorDialog.show();
                });
                window.add_toast(toast);
                return; // Exit the function if file does not exist
            }
            
            // Try importing the config file
            try {
                keyFile.load_from_file(filePath, GLib.KeyFileFlags.NONE);
                let commandCount = 0;
                for (let i = 1; i <= numberOfCommands; i++) {
                    if (keyFile.has_group(`Command ${i}`)) {
                        let name = keyFile.get_string(`Command ${i}`, 'Name');
                        let command = keyFile.get_string(`Command ${i}`, 'Command');
                        let icon = keyFile.get_string(`Command ${i}`, 'Icon');
                        window._settings.set_string(`entryrow${i}a-setting`, name);
                        window._settings.set_string(`entryrow${i}b-setting`, command);
                        window._settings.set_string(`entryrow${i}c-setting`, icon);
                        commandCount++;
                    } else {
                        window._settings.set_string(`entryrow${i}a-setting`, "");
                        window._settings.set_string(`entryrow${i}b-setting`, "");
                        window._settings.set_string(`entryrow${i}c-setting`, "");
                    }
                }
                console.log(`[Custom Command Menu] Commands imported from ${filePath}`);
                const toast = Adw.Toast.new(_(`Successfully imported ${commandCount} command${commandCount != 1 ? 's' : ''}`));
                toast.set_timeout(3);
                window.add_toast(toast);
            } catch (e) {
                console.log(`[Custom Command Menu] Failed to import commands\n${e}`);
                const toast = Adw.Toast.new(_(`Import Error`));
                toast.set_timeout(3);
                toast.set_button_label(_('Details'));
                toast.connect('button-clicked', () => {
                    let errorDialog = new Adw.MessageDialog({
                        transient_for: window,
                        modal: true,
                        heading: _('Import Error'),
                        body: _(`Failed to import command list\n\n${e}`),
                    });
                    errorDialog.add_response('ok', _('OK'));
                    errorDialog.connect('response', () => errorDialog.destroy());
                    errorDialog.show();
                });
                window.add_toast(toast);
            }
        });
        //#endregion Import


        //#region Setup Information
        const configGroup1 = new Adw.PreferencesGroup({
            title: _('Setup Information'),
        });

        const configRow1 = new Adw.ActionRow({
            title: _('Commands'),
            subtitle: _(
                        'Enter the display names and associated commands to appear in the drop-down menu. ' +
                        'Leave the name field blank to exclude an entry from the menu. ' 
                       ),
            activatable: false,
        });
        
        const configRow2 = new Adw.ActionRow({
            title: _('Icons'),
            subtitle: _(
                        'For a list of available icons, refer to the link below or navigate to the icon directory for your system\'s theme. ' +
                        'Enter the name of the icon (without the file extension), or leave blank for no icon. '
                       ),
            activatable: false,
        });
        
        const configRow3 = new Adw.ActionRow({
            title: _('Icon List'),
            subtitle: _('List of default symbolic icons'),
            activatable: true,
        });
        configRow3.connect('activated', () => {
            Gio.app_info_launch_default_for_uri('https://github.com/StorageB/icons/blob/main/GNOME46Adwaita/icons.md', null);
        });
        configRow3.add_prefix(new Gtk.Image({icon_name: 'web-browser-symbolic'}));
        configRow3.add_suffix(new Gtk.Image({icon_name: 'go-next-symbolic'}));
        
        const configRow4 = new Adw.ActionRow({
            title: _('Local Icons'),
            subtitle: _('Local icon directory (/usr/share/icons)'),
            activatable: true,
        });
        configRow4.connect('activated', () => {
            Gio.app_info_launch_default_for_uri('file:///usr/share/icons', null);
        });
        configRow4.add_prefix(new Gtk.Image({icon_name: 'folder-symbolic'}));
        configRow4.add_suffix(new Gtk.Image({icon_name: 'go-next-symbolic'}));
        //#endregion Setup Information
        

        //#region About
        const aboutGroup1 = new Adw.PreferencesGroup({
            title: _('About'),
        });

        const aboutRow0 = new Adw.ActionRow({
            title: _('What\'s New'),
            subtitle: _('List of recent changes and improvements'),
            activatable: true,
        });
        aboutRow0.connect('activated', () => {
            const dialog = new Gtk.MessageDialog({
                transient_for: window,
                modal: true,
                text: _('Release Notes'),
                secondary_text: releaseNotes,
                buttons: Gtk.ButtonsType.CLOSE,
            });
            dialog.connect('response', () => dialog.destroy());
            dialog.show();
        });
        aboutRow0.add_prefix(new Gtk.Image({icon_name: 'dialog-information-symbolic'}));
        aboutRow0.add_suffix(new Gtk.Image({icon_name: 'go-next-symbolic'}));
        
        const aboutRow1 = new Adw.ActionRow({
            title: _('Homepage'),
            subtitle: _('GitHub page for additional information and bug reporting'),
            activatable: true,
        });
        aboutRow1.connect('activated', () => {
            Gio.app_info_launch_default_for_uri('https://github.com/StorageB/custom-command-menu', null);
        });
        aboutRow1.add_prefix(new Gtk.Image({icon_name: 'go-home-symbolic'}));
        aboutRow1.add_suffix(new Gtk.Image({icon_name: 'go-next-symbolic'}));
        
        const aboutRow2 = new Adw.ActionRow({
            title: _('Extension Page'),
            subtitle: _('GNOME extension page'),
            activatable: true,
        });
        aboutRow2.connect('activated', () => {
            Gio.app_info_launch_default_for_uri('https://extensions.gnome.org/extension/7024/custom-command-list/', null);
        });
        aboutRow2.add_prefix(new Gtk.Image({icon_name: 'web-browser-symbolic'}));
        aboutRow2.add_suffix(new Gtk.Image({icon_name: 'go-next-symbolic'}));
        //#endregion About


        //#region Settings
        const settingsGroup1 = new Adw.PreferencesGroup({
            title: _('Settings'),
        });

        const titleExpanderRow = new Adw.ExpanderRow({
            title: _('Custom Menu Title'),
            subtitle: _('Use custom text or a custom icon for the menu title'),
        });

        const menuOptionList = new Gtk.StringList();
        [_('Text'), _('Icon')].forEach(choice => menuOptionList.append(choice));
    
        const menuComboRow = new Adw.ComboRow({
            title: _('Menu Type'),
            subtitle: _('Select menu type to be text or an icon'),
            model: menuOptionList,
            selected: window._settings.get_int('menuoptions-setting'),
        });

        const titleEntryRow = new Adw.EntryRow({
            title: menuComboRow.selected === 1 ? _('Icon name:') : _('Menu title:'),
        });
        
        menuComboRow.connect('notify::selected', () => {
            let selected = menuComboRow.selected; 
            titleEntryRow.title = selected === 1 ? _('Icon name:') : _('Menu title:');  
            titleEntryRow.text = selected === 1 
                ? window._settings.get_string('menuicon-setting') || '' 
                : window._settings.get_string('menutitle-setting') || '';
        });

        titleEntryRow.connect('changed', (entry) => {
            let selected = menuComboRow.selected;
                if (selected === 1) {
                    window._settings.set_string('menuicon-setting', entry.get_text());
                } else {
                    window._settings.set_string('menutitle-setting', entry.get_text());
                }   
        });

        window._settings.bind('menuoptions-setting', menuComboRow, 'selected', Gio.SettingsBindFlags.DEFAULT);
        
        if (window._settings.get_int('menuoptions-setting') === 1) {
            titleEntryRow.text = window._settings.get_string('menuicon-setting') || '';
        } else {
            titleEntryRow.text = window._settings.get_string('menutitle-setting') || '';
        }
        //#endregion Settings


        //#region Layout
        page2.add(backupGroup1);
        backupGroup1.add(exportRow);
        backupGroup1.add(importRow);

        page2.add(configGroup1);
        configGroup1.add(configRow1);
        configGroup1.add(configRow2);
        configGroup1.add(configRow3);
        configGroup1.add(configRow4);

        page2.add(settingsGroup1);
        settingsGroup1.add(titleExpanderRow);
        titleExpanderRow.add_row(menuComboRow);
        titleExpanderRow.add_row(titleEntryRow);
                
        page2.add(aboutGroup1);
        aboutGroup1.add(aboutRow0);
        aboutGroup1.add(aboutRow1);
        aboutGroup1.add(aboutRow2);
        //#endregion Layout

    }
}
