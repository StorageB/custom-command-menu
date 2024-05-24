/* prefs.js */
 
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class CustomCommandListPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group0 = new Adw.PreferencesGroup({
            title: _('Commands'),
            description: _('Enter display names and associated commands to appear in the drop-down menu. Leave the name field blank to exclude commands from the menu.'),
        });
        page.add(group0);

        // Create groups and entry rows
        for (let i = 1; i <= 10; i++) {
            const group = new Adw.PreferencesGroup({});
            page.add(group);

            const entryrowA = new Adw.EntryRow({
                title: _('Name:'),
            });
            group.add(entryrowA);
            
            const entryrowB = new Adw.EntryRow({
                title: _('Command:'),
            });
            group.add(entryrowB);

            // Bind settings 
            window._settings = this.getSettings();
            window._settings.bind(`entryrow${i}a-setting`, entryrowA, 'text', Gio.SettingsBindFlags.DEFAULT);
            window._settings.bind(`entryrow${i}b-setting`, entryrowB, 'text', Gio.SettingsBindFlags.DEFAULT);
        }
    }
}
