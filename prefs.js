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
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import {releaseNotes} from './about.js';
import commandsUI from "./commandsUI.js";

let numberOfCommands = 30;
let fileName = 'commands.ini';
let filePath = GLib.build_filenamev([GLib.get_home_dir(), fileName]);


export default class CustomCommandListPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window.set_default_size(700, 900);
        window._settings = this.getSettings();

        let page = new commandsUI({
            title: _('Commands'),
            icon_name: 'utilities-terminal-symbolic',
            Settings: window._settings,
        });
        window.add(page);

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
            let commandOrderArray = window._settings.get_value('command-order').deep_unpack();
            let commandNumber = 0;
        
            // Loop through command entries and write them to the keyfile
            for (let i = 1; i <= numberOfCommands; i++) {
                let name = window._settings.get_string(`entryrow${commandOrderArray[i-1]}a-setting`);
                let command = window._settings.get_string(`entryrow${commandOrderArray[i-1]}b-setting`);
                let icon = window._settings.get_string(`entryrow${commandOrderArray[i-1]}c-setting`);
                let visible = window._settings.get_boolean(`visible${commandOrderArray[i-1]}-setting`);
                // Only write commands that are not blank
                if (name !== '' || command !== '' || icon !== '') {
                    commandNumber ++;
                    keyFile.set_string(`Command ${commandNumber}`, 'Name', name);
                    keyFile.set_string(`Command ${commandNumber}`, 'Command', command);
                    keyFile.set_string(`Command ${commandNumber}`, 'Icon', icon);
                    keyFile.set_boolean(`Command ${commandNumber}`, 'Visible', visible);
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
                        let icon = ""; try { icon = keyFile.get_string(`Command ${i}`, 'Icon'); } catch (_) {}
                        let visible = true; try { visible = keyFile.get_boolean(`Command ${i}`, 'Visible'); } catch (_) {}
                        window._settings.set_string(`entryrow${i}a-setting`, name);
                        window._settings.set_string(`entryrow${i}b-setting`, command);
                        window._settings.set_string(`entryrow${i}c-setting`, icon);
                        window._settings.set_boolean(`visible${i}-setting`, visible);
                        commandCount++;
                    } else {
                        window._settings.set_string(`entryrow${i}a-setting`, "");
                        window._settings.set_string(`entryrow${i}b-setting`, "");
                        window._settings.set_string(`entryrow${i}c-setting`, "");
                        window._settings.set_boolean(`visible${i}-setting`, "");
                    }
                }
                window._settings.set_value('command-order', new GLib.Variant('ai', Array.from({ length: numberOfCommands }, (_, i) => i + 1)));
                page.refreshCommandList(); // refresh the list of commands in the prefrences window
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
                        'Enter the display names and associated commands for the drop-down menu.\n' +
                        '•  Type --- or ~~~ in the name field to create a visual separator line in the menu.\n' +
                        '•  Adding text after --- or ~~~ creates a labeled separator.\n' +
                        '•  Toggle the checkbox to show or hide a command.\n' +
                        '•  Drag and drop to reorder commands.'
                       ),
            activatable: false,
        });
        
        const configRow2 = new Adw.ActionRow({
            title: _('Icons'),
            subtitle: _(
                        'For a list of available icons, refer to the Icon List link below. ' +
                        'Enter the name of the icon, or leave blank for no icon. ' +
                        'Refer to the Github Homepage for more icon configuration options.'
                       ),
            activatable: false,
        });
        
        const configRow3 = new Adw.ActionRow({
            title: _('Icon List'),
            subtitle: _('List of default symbolic icons'),
            activatable: true,
        });
        configRow3.connect('activated', () => {
            Gio.app_info_launch_default_for_uri('https://github.com/StorageB/icons/blob/main/GNOME48Adwaita/icons.md', null);
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

        const menuLocationList = new Gtk.StringList();
        [_('Default'), _('Left'), _('Right')].forEach(choice => menuLocationList.append(choice));
    
        const menuLocationComboRow = new Adw.ComboRow({
            title: _('Menu Location'),
            subtitle: _('Select location for the menu in the top bar'),
            model: menuLocationList,
            selected: window._settings.get_int('menulocation-setting'),
        });

        menuLocationComboRow.connect('notify::selected', () => {
            menuPositionSpinRow.visible = menuLocationComboRow.selected !== 0;
        });        

        window._settings.bind('menulocation-setting', menuLocationComboRow, 'selected', Gio.SettingsBindFlags.DEFAULT);

        const menuPositionSpinRow = new Adw.SpinRow({
            title: _('Menu Position'),
            subtitle: _('Adjust position of the menu in the top bar'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 20,
                step_increment: 1,
            }),
            value: window._settings.get_int('menuposition-setting'),
        });
        menuPositionSpinRow.visible = menuLocationComboRow.selected !== 0;

        window._settings.bind('menuposition-setting', menuPositionSpinRow, 'value', Gio.SettingsBindFlags.DEFAULT);        
        //#endregion Settings


        //#region Layout
        page2.add(backupGroup1);
        backupGroup1.add(exportRow);
        backupGroup1.add(importRow);

        page2.add(configGroup1);
        configGroup1.add(configRow1);
        configGroup1.add(configRow2);
        configGroup1.add(configRow3);
        //configGroup1.add(configRow4);

        page2.add(settingsGroup1);
        settingsGroup1.add(titleExpanderRow);
        titleExpanderRow.add_row(menuComboRow);
        titleExpanderRow.add_row(titleEntryRow);
        settingsGroup1.add(menuLocationComboRow);
        settingsGroup1.add(menuPositionSpinRow);
                
        page2.add(aboutGroup1);
        aboutGroup1.add(aboutRow0);
        aboutGroup1.add(aboutRow1);
        aboutGroup1.add(aboutRow2);

        this.addMaximizeButton(window);
        //#endregion Layout
    }


    //#region addMaximizeButton
    addMaximizeButton(window) {
        const icon = new Gtk.Image({
            icon_name: 'window-maximize-symbolic',
            pixel_size: 16,
        });
        const button = new Gtk.Button({
            valign: Gtk.Align.CENTER,
            child: icon,
        });
        button.add_css_class('circular');
        button.set_size_request(24, 24);

        const cssProvider = new Gtk.CssProvider();
        cssProvider.load_from_data(`
        button.circular {
            padding: 0;
            min-width: 24px;
            min-height: 24px;
            max-width: 24px;
            max-height: 24px;
        }
        `, -1);
        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            cssProvider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        );

        button.connect('clicked', () => {
            if (window.is_maximized()) window.unmaximize();
            else window.maximize();
        });

        window.connect('notify::maximized', () => {
            icon.set_from_icon_name(window.is_maximized() ? 'window-restore-symbolic' : 'window-maximize-symbolic');
        });

        const header = this.findWidgetByType(window.get_content(), Adw.HeaderBar);
        if (header) {
            header.pack_end(button);
            button.show();
        } else {
            console.log('[Custom Command Menu] Error adding maximize button');
        }

        return button;
    }
    //#endregion addMaximizeButton

    
    //#region findWidgetByType
    findWidgetByType(parent, type) {
        for (const child of [...parent]) {
            if (child instanceof type) return child;
            const found = this.findWidgetByType(child, type);
            if (found) return found;
        }
        return null;
    }
    //#endregion findWidgetByType
}
