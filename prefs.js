/* prefs.js */
 
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class CustomCommandListPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage({
            title: _('Commands'),
            icon_name: 'utilities-terminal-symbolic',
        });
        window.add(page);

        const group0 = new Adw.PreferencesGroup({
            title: _('Command List'),
        });
        page.add(group0);

        // Create groups and entry rows for commands
        for (let i = 1; i <= 10; i++) {
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
                expanderRow.title = entryrowA.text
                expanderRow.subtitle = (entryrowA.text === '' && entryrowB.text === '') ? ('(not assigned)') : entryrowB.text.replace(/&/g, '&amp;');
            });
            entryrowB.connect('notify::text', () => {
                expanderRow.subtitle = (entryrowA.text === '' && entryrowB.text === '') ? ('(not assigned)') : entryrowB.text.replace(/&/g, '&amp;');
            });

            // Initialize title and subtitle
            entryrowA.notify('text');
            entryrowB.notify('text');
        }


        const page2 = new Adw.PreferencesPage({
            title: _('Information'),
            icon_name: 'help-about-symbolic',
        });
        window.add(page2);

        const configGroup1 = new Adw.PreferencesGroup({
            title: _('Configuration'),
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
            Gio.app_info_launch_default_for_uri('https://github.com/StorageB/icons/blob/main/Yaru/icons.md', null);
        });
        configRow3.add_prefix(new Gtk.Image({icon_name: 'web-browser-symbolic'}));
        configRow3.add_suffix(new Gtk.Image({icon_name: 'external-link-symbolic'}));
        
        const configRow4 = new Adw.ActionRow({
            title: _('Local Icons'),
            subtitle: _('Local icon directory (/usr/share/icons)'),
            activatable: true,
        });
        configRow4.connect('activated', () => {
            Gio.app_info_launch_default_for_uri('file:///usr/share/icons', null);
        });
        configRow4.add_prefix(new Gtk.Image({icon_name: 'folder-symbolic'}));
        configRow4.add_suffix(new Gtk.Image({icon_name: 'external-link-symbolic'}));
        
        const aboutGroup = new Adw.PreferencesGroup({
            title: _('About'),
        });
        
        const aboutRow1 = new Adw.ActionRow({
            title: _('Homepage'),
            subtitle: _('GitHub page for additional information and bug reporting'),
            activatable: true,
        });
        aboutRow1.connect('activated', () => {
            Gio.app_info_launch_default_for_uri('https://github.com/StorageB/custom-command-menu', null);
        });
        aboutRow1.add_prefix(new Gtk.Image({icon_name: 'go-home-symbolic'}));
        aboutRow1.add_suffix(new Gtk.Image({icon_name: 'external-link-symbolic'}));
        
        const aboutRow2 = new Adw.ActionRow({
            title: _('Extension Page'),
            subtitle: _('GNOME extension page'),
            activatable: true,
        });
        aboutRow2.connect('activated', () => {
            Gio.app_info_launch_default_for_uri('https://extensions.gnome.org/extension/7024/custom-command-list/', null);
        });
        aboutRow2.add_prefix(new Gtk.Image({icon_name: 'web-browser-symbolic'}));
        aboutRow2.add_suffix(new Gtk.Image({icon_name: 'external-link-symbolic'}));
        

        page2.add(configGroup1);
        configGroup1.add(configRow1);
        configGroup1.add(configRow2);
        configGroup1.add(configRow3);
        configGroup1.add(configRow4);

        page2.add(aboutGroup);
        aboutGroup.add(aboutRow1);
        aboutGroup.add(aboutRow2);

    }
}
