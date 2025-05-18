/* commandsUI.js 
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


import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

let numberOfCommands = 30;

export default class commandsUI extends Adw.PreferencesPage {
    static {
        GObject.registerClass({
            GTypeName: 'commandsUI',
        }, this);
    }

    _init(params = {}) {
        this._settings = params?.Settings;
        let { Settings, ...args } = params;
        super._init(args);

        const style = new Gtk.CssProvider();
        const cssData = `button > label { font-weight: normal; }`;
        style.load_from_data(cssData, cssData.length);
        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            style,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        );

        this._commandBoxList = new Gtk.ListBox();
        this._commandBoxList.add_css_class('boxed-list');

        const clamp = new Adw.Clamp({ child: this._commandBoxList });
        const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        box.append(clamp);

        const group = new Adw.PreferencesGroup();
        group.add(box);
        this.add(group);

        this._initDragMenu();
    }

    //#region addRow
    _addRow(dragBox, rowNumber, index) {
        const row = new Adw.ExpanderRow({
            title: '',
            selectable: false,
            expanded: false,
        });
        row._rowNumber = rowNumber;

        const entryRowName = new Adw.EntryRow({ title: _('Name:') });
        const entryRowCommand = new Adw.EntryRow({ title: _('Command:') });
        const entryRowIcon = new Adw.EntryRow({ title: _('Icon:') });

        row.add_row(entryRowName);
        row.add_row(entryRowCommand);
        row.add_row(entryRowIcon);

        this._settings.bind(`entryrow${rowNumber}a-setting`, entryRowName, 'text', Gio.SettingsBindFlags.DEFAULT);
        this._settings.bind(`entryrow${rowNumber}b-setting`, entryRowCommand, 'text', Gio.SettingsBindFlags.DEFAULT);
        this._settings.bind(`entryrow${rowNumber}c-setting`, entryRowIcon, 'text', Gio.SettingsBindFlags.DEFAULT);

        row.title = entryRowName.text.replace(/&/g, '&amp;');

        //#region (menuButton)
        const menuButton = new Gtk.MenuButton({
            icon_name: 'view-more-symbolic',
            valign: Gtk.Align.CENTER,
            has_frame: false,
        });

        const popover = new Gtk.Popover({ autohide: true });
        const menuBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });

        const createFlatButton = (labelText, onClick) => {
            const button = new Gtk.Button({
                child: new Gtk.Label({ label: labelText, xalign: 0 }),
                has_frame: false,
            });
            button.connect('clicked', () => {
                onClick();
                popover.popdown();
            });
            return button;
        };

        //#region (duplicate)
        menuBox.append(createFlatButton(_('Duplicate'), () => {
            for (const child of this._commandBoxList) {
                if (child instanceof Adw.ExpanderRow && !child.visible) {
                    const newRowNumber = child._rowNumber;

                    this._settings.set_string(`entryrow${newRowNumber}a-setting`, this._settings.get_string(`entryrow${row._rowNumber}a-setting`) + ' (copy)');
                    this._settings.set_string(`entryrow${newRowNumber}b-setting`, this._settings.get_string(`entryrow${row._rowNumber}b-setting`));
                    this._settings.set_string(`entryrow${newRowNumber}c-setting`, this._settings.get_string(`entryrow${row._rowNumber}c-setting`));
                    this._settings.set_boolean(`visible${newRowNumber}-setting`, true);
                    child._checkButton.get_child().set_from_icon_name("checkbox-checked-symbolic");
                    child.remove_css_class('dim-label');
                    
                    this._commandBoxList.remove(child);
                    const updatedRows = this._getListBoxRows(this._commandBoxList);
                    const insertIndex = updatedRows.indexOf(row) + 1;
                    this._commandBoxList.insert(child, insertIndex);

                    child.set_visible(true);
                    child.set_expanded(true);
                    this._emitReorder();

                    break;
                }
            }
        }));

        //#region (delete)
        menuBox.append(createFlatButton(_('Delete'), () => {
            row.visible = false;
            this._settings.set_string(`entryrow${rowNumber}a-setting`, '');
            this._settings.set_string(`entryrow${rowNumber}b-setting`, '');
            this._settings.set_string(`entryrow${rowNumber}c-setting`, '');
            this._settings.set_boolean(`visible${rowNumber}-setting`, true);
        }));

        popover.set_child(menuBox);
        menuButton.set_popover(popover);
        row.add_suffix(menuButton);

        //#region (checkbox)
        let checkButtonIcon = this._settings.get_boolean(`visible${rowNumber}-setting`) ? 'checkbox-checked-symbolic' : 'checkbox-symbolic';
        const checkButton = new Gtk.Button({
            child: new Gtk.Image({ icon_name: checkButtonIcon, pixel_size: 14 }),
            has_frame: false,
            valign: Gtk.Align.CENTER,
        });
        row._checkButton = checkButton;

        if (checkButtonIcon === 'checkbox-checked-symbolic')
            row.remove_css_class('dim-label');
        else
            row.add_css_class('dim-label');

        checkButton.connect('clicked', () => {
            const image = checkButton.get_child();
            const newIcon = image.icon_name === 'checkbox-checked-symbolic' ? 'checkbox-symbolic' : 'checkbox-checked-symbolic';
            image.set_from_icon_name(newIcon);
            this._settings.set_boolean(`visible${rowNumber}-setting`, newIcon === 'checkbox-checked-symbolic');

            // Add/remove 'dim-label' class on the row
            if (newIcon === 'checkbox-checked-symbolic')
                row.remove_css_class('dim-label');
            else
                row.add_css_class('dim-label');

        });
        row.add_suffix(checkButton);

        entryRowName.connect('notify::text', () => {
            row.title = entryRowName.text.replace(/&/g, '&amp;');
        });

        row.add_prefix(new Gtk.Image({
            icon_name: 'list-drag-handle-symbolic',
            css_classes: ['dim-label'],
        }));

        //#region (drag)
        let dragX, dragY;
        const dropController = new Gtk.DropControllerMotion();
        const dragSource = new Gtk.DragSource({ actions: Gdk.DragAction.MOVE });

        row.add_controller(dragSource);
        row.add_controller(dropController);

        dragSource.connect('prepare', (_source, x, y) => {
            dragX = x;
            dragY = y;
            const value = new GObject.Value();
            value.init(Gtk.ListBoxRow);
            value.set_object(row);
            return Gdk.ContentProvider.new_for_value(value);
        });

        dragSource.connect('drag-begin', (_source, drag) => {
            const dragWidget = new Gtk.ListBox();
            dragWidget.set_size_request(row.get_width(), row.get_height());
            dragWidget.add_css_class('boxed-list');

            const dragRow = new Adw.ExpanderRow({
                title: row.title,
                selectable: false,
            });
            dragRow.add_prefix(new Gtk.Image({
                icon_name: 'list-drag-handle-symbolic',
                css_classes: ['dim-label'],
            }));

            dragWidget.append(dragRow);
            dragWidget.drag_highlight_row(dragRow);

            const icon = Gtk.DragIcon.get_for_drag(drag);
            icon.child = dragWidget;
            drag.set_hotspot(dragX, dragY);
        });

        dropController.connect('enter', () => dragBox.drag_highlight_row(row));
        dropController.connect('leave', () => dragBox.drag_unhighlight_row());
        dragBox.insert(row, index);

        if (entryRowName.text === '' && entryRowCommand.text === '' && entryRowIcon.text === '') {
            row.visible = false;
        }
    }
    //#endregion addRow


    //#region initDragMenu
    _initDragMenu() {
        const commandBoxTarget = Gtk.DropTarget.new(Gtk.ListBoxRow, Gdk.DragAction.MOVE);
        this._commandBoxList.add_controller(commandBoxTarget);

        let savedOrder = [];
        try {
            savedOrder = this._settings.get_value('command-order').deep_unpack();
        } catch (e) {
            console.log('[Custom Command Menu] Failed to read command-order from settings:', e);
        }

        if (!Array.isArray(savedOrder) || savedOrder.length !== numberOfCommands) {
            savedOrder = Array.from({ length: numberOfCommands }, (_, i) => i + 1);
        }

        for (let i = 0; i < savedOrder.length; i++) {
            const rowNumber = savedOrder[i];
            this._addRow(this._commandBoxList, rowNumber, -1);
        }

        //#region (add command)
        this._addCommandButton = new Gtk.ListBoxRow({
            selectable: false,
            activatable: true,
        });

        const buttonBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 6,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER,
            margin_top: 8,
            margin_bottom: 8,
        });

        const icon = new Gtk.Image({
            icon_name: 'list-add-symbolic',
            pixel_size: 16,
        });
        icon.add_css_class('dim-label');

        const label = new Gtk.Label({ label: _('Add Command') });
        label.add_css_class('dim-label');
        label.set_xalign(0.5);

        buttonBox.append(icon);
        buttonBox.append(label);
        this._addCommandButton.set_child(buttonBox);

        const clickGesture = new Gtk.GestureClick();
        clickGesture.connect('released', () => {
            for (const child of this._commandBoxList) {
                if (child instanceof Adw.ExpanderRow) {
                    const name = this._settings.get_string(`entryrow${child._rowNumber}a-setting`);
                    const command = this._settings.get_string(`entryrow${child._rowNumber}b-setting`);
                    const icon = this._settings.get_string(`entryrow${child._rowNumber}c-setting`);
        
                    if (name === '' && command === '' && icon === '') {
                        // Remove and reinsert at end (before add button)
                        this._commandBoxList.remove(child);
                        const index = Array.from(this._commandBoxList).indexOf(this._addCommandButton);
                        this._commandBoxList.insert(child, index);
        
                        // Update command-order setting
                        let order = this._settings.get_value('command-order').deep_unpack();
                        // Remove old position of this rowNumber, if it exists
                        order = order.filter(n => n !== child._rowNumber);
                        // Push to the end
                        order.push(child._rowNumber);
                        this._settings.set_value('command-order', new GLib.Variant('ai', order));
                        
                        this._settings.set_boolean(`visible${child._rowNumber}-setting`, true);
                        child._checkButton.get_child().set_from_icon_name("checkbox-checked-symbolic");
                        child.remove_css_class('dim-label');
        
                        child.visible = true;
                        child.expanded = true;
                        break;
                    }
                }
            }
        });

        this._addCommandButton.add_controller(clickGesture);

        const ignoreDrop = new Gtk.DropControllerMotion();
        ignoreDrop.connect('enter', () => this._commandBoxList.drag_unhighlight_row());
        ignoreDrop.connect('leave', () => this._commandBoxList.drag_unhighlight_row());
        this._addCommandButton.add_controller(ignoreDrop);

        this._commandBoxList.append(this._addCommandButton);

        commandBoxTarget.connect('drop', (target, value, x, y) =>
            this._onTargetDropped(target, value, x, y, this._commandBoxList)
        );
    }
    //#endregion initDragMenu


    //#region functions
    _onTargetDropped(_drop, value, _x, y, listbox) {
        const targetRow = listbox.get_row_at_y(y);
        if (!value || !targetRow) return false;

        this._commandBoxList.drag_unhighlight_row();

        if (targetRow === this._addCommandButton) return;

        for (const row of this._commandBoxList) {
            if (row === value) {
                this._commandBoxList.remove(value);
                break;
            }
        }

        listbox.insert(value, targetRow.get_index());
        this._emitReorder();
        return true;
    }


    _emitReorder() {
        let order = [];
        for (const row of this._commandBoxList) {
            if (row !== this._addCommandButton && row._rowNumber)
                order.push(row._rowNumber);
        }
        this._settings.set_value('command-order', new GLib.Variant('ai', order));
    }


    _getListBoxRows(listBox) {
        let rows = [];
        let row = listBox.get_first_child();
        while (row) {
            rows.push(row);
            row = row.get_next_sibling();
        }
        return rows;
    }

    
    refreshCommandList() {
        // Remove all current rows except the "Add Command" button
        const rowsToRemove = Array.from(this._commandBoxList).filter(child => child instanceof Adw.ExpanderRow);
        for (const row of rowsToRemove) {
            this._commandBoxList.remove(row);
        }
    
        // Rebuild rows based on current settings
        let savedOrder;
        try {
            savedOrder = this._settings.get_value('command-order').deep_unpack();
        } catch (e) {
            console.log('Failed to read command-order from settings:', e);
            savedOrder = Array.from({ length: numberOfCommands }, (_, i) => i + 1);
        }
    
        for (let i = 0; i < savedOrder.length; i++) {
            const rowNumber = savedOrder[i];
            this._addRow(this._commandBoxList, rowNumber, -1);
        }
    
        // Make sure "Add Command" button stays at the end
        this._commandBoxList.remove(this._addCommandButton);
        this._commandBoxList.append(this._addCommandButton);
    }
    //#endregion functions
}
