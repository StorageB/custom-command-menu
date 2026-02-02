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

let numberOfCommands = 99;
let draggedRow = null;

export default class commandsUI extends Adw.PreferencesPage {
    static {
        GObject.registerClass({
            GTypeName: 'commandsUI',
        }, this);
    }

    _init(params = {}) {
        this._settings = params?.Settings;
        this._expanderRows = [];
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

        this._scroller = new Gtk.ScrolledWindow();
        this._scroller.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        this._scroller.set_propagate_natural_height(true);
        this._scroller.set_child(this._commandBoxList);

        const clamp = new Adw.Clamp({ child: this._scroller });

        this._overlay = new Adw.ToastOverlay();
        this._overlay.set_child(clamp);
        
        const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        box.append(this._overlay);

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
        this._expanderRows.push(row);

        const entryRowName = new Adw.EntryRow({ title: _('Name:') });
        const entryRowCommand = new Adw.EntryRow({ title: _('Command:') });
        const entryRowIcon = new Adw.EntryRow({ title: _('Icon:') });

        row.add_row(entryRowName);
        row.add_row(entryRowCommand);
        row.add_row(entryRowIcon);

        row._entryRowName = entryRowName;
        row._entryRowCommand = entryRowCommand;
        row._entryRowIcon = entryRowIcon;        

        const [name, command, icon] = this._settings.get_value(`command${rowNumber}`).deep_unpack();
        entryRowName.text = name;
        entryRowCommand.text = command;
        entryRowIcon.text = icon;

        row.title = entryRowName.text.replace(/&/g, '&amp;');

        //#region (menuButton)
        const gMenu = new Gio.Menu();
        gMenu.append(_('Insert new'), 'row.insert');
        gMenu.append(_('Duplicate'), 'row.duplicate');
        gMenu.append(_('Delete'), 'row.delete');

        const menuButton = new Gtk.MenuButton({
            icon_name: 'view-more-symbolic',
            valign: Gtk.Align.CENTER,
            has_frame: false,
            menu_model: gMenu,
        });
        const actionGroup = new Gio.SimpleActionGroup();
        

        //#region (insert)
        const insertAction = new Gio.SimpleAction({ name: 'insert' });
        insertAction.connect('activate', () => {
            let inserted = false;
            for (const child of this._commandBoxList) {
                if (child instanceof Adw.ExpanderRow && !child.visible) {

                    this._settings.set_value(`command${child._rowNumber}`, new GLib.Variant('(sssb)', ["", "", "", true]));
                    child._entryRowName.text = '';
                    child._entryRowCommand.text = '';
                    child._entryRowIcon.text = '';
                    child.title = '';

                    child._checkButton.get_child().set_from_icon_name("checkbox-checked-symbolic");
                    child.remove_css_class('dim-label');
                    
                    this._commandBoxList.remove(child);
                    const updatedRows = this._getListBoxRows(this._commandBoxList);
                    const insertIndex = updatedRows.indexOf(row) + 1;
                    this._commandBoxList.insert(child, insertIndex);

                    child.visible = true;
                    child.expanded = true;
                    this._emitReorder();

                    inserted = true;
                    break;
                }
            }
            if (!inserted) this._overlay.add_toast(new Adw.Toast({ title: _('Maximum row limit reached') }));
            GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                this._refreshMenuTitles();
                return GLib.SOURCE_REMOVE;
            });            
        });    
        actionGroup.add_action(insertAction);    

        
        //#region (duplicate)
        const duplicateAction = new Gio.SimpleAction({ name: 'duplicate' });
        duplicateAction.connect('activate', () => {
            let inserted = false;
            for (const child of this._commandBoxList) {
                if (child instanceof Adw.ExpanderRow && !child.visible) {

                    const [name, command, icon] = this._settings.get_value(`command${row._rowNumber}`).deep_unpack();
                    const newName = `${name} (copy)`;

                    this._settings.set_value(`command${child._rowNumber}`, new GLib.Variant('(sssb)', [newName, command, icon, true]));

                    child._entryRowName.text = newName;
                    child._entryRowCommand.text = command;
                    child._entryRowIcon.text = icon;
                    child.title = newName.replace(/&/g, '&amp;');                    

                    child._checkButton.get_child().set_from_icon_name("checkbox-checked-symbolic");
                    child.remove_css_class('dim-label');
                    
                    this._commandBoxList.remove(child);
                    const updatedRows = this._getListBoxRows(this._commandBoxList);
                    const insertIndex = updatedRows.indexOf(row) + 1;
                    this._commandBoxList.insert(child, insertIndex);

                    child.visible = true;
                    child.expanded = true;
                    this._emitReorder();

                    inserted = true;
                    break;
                }
            }
            if (!inserted) this._overlay.add_toast(new Adw.Toast({ title: _('Maximum row limit reached') }));
            GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                this._refreshMenuTitles();
                return GLib.SOURCE_REMOVE;
            });            
        });
        actionGroup.add_action(duplicateAction);    


        //#region (delete)
        const deleteAction = new Gio.SimpleAction({ name: 'delete' });
        deleteAction.connect('activate', () => {

            const adjustment = this._scroller.get_vadjustment();
            const scrollValue = adjustment.get_value();
            draggedRow = null;

            row._entryRowName.text = '';
            row._entryRowCommand.text = '';
            row._entryRowIcon.text = '';
            row.title = '';

            row.visible = false;
            this._settings.set_value(`command${rowNumber}`, new GLib.Variant('(sssb)', ["", "", "", true]));

            GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                adjustment.set_value(scrollValue);
                return GLib.SOURCE_REMOVE;
            });

            const clock = this._scroller.get_frame_clock?.();
            if (clock) {
                const handlerId = clock.connect('after-paint', () => {
                    adjustment.set_value(scrollValue);
                    clock.disconnect(handlerId);
                });
            }
            GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                this._refreshMenuTitles();
                return GLib.SOURCE_REMOVE;
            });            
        });
        actionGroup.add_action(deleteAction);  
        
        row.add_suffix(menuButton);
        row.insert_action_group('row', actionGroup);


        //#region (checkbox)
        let checkButtonIcon = this._settings.get_value(`command${rowNumber}`).deep_unpack()[3] ? 'checkbox-checked-symbolic' : 'checkbox-symbolic';
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

            const [name, command, icon] = this._settings.get_value(`command${rowNumber}`).deep_unpack();

            this._settings.set_value(
                `command${rowNumber}`,
                new GLib.Variant('(sssb)', [
                    name,
                    command,
                    icon,
                    newIcon === 'checkbox-checked-symbolic',
                ])
            );

            if (newIcon === 'checkbox-checked-symbolic')
                row.remove_css_class('dim-label');
            else
                row.add_css_class('dim-label');

            GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                this._refreshMenuTitles();
                return GLib.SOURCE_REMOVE;
            });                 

        });
        row.add_suffix(checkButton);

        entryRowName.connect('notify::text', () => {
            row.title = entryRowName.text.replace(/&/g, '&amp;');
            const [, , , visible] = this._settings.get_value(`command${rowNumber}`).deep_unpack();
            this._settings.set_value(
                `command${rowNumber}`,
                new GLib.Variant('(sssb)', [
                    entryRowName.text,
                    entryRowCommand.text,
                    entryRowIcon.text,
                    visible,
                ])
            );

            GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                this._refreshMenuTitles();
                return GLib.SOURCE_REMOVE;
            });            
        });

        entryRowCommand.connect('notify::text', () => {
            const [name, , icon, visible] = this._settings.get_value(`command${rowNumber}`).deep_unpack();
            this._settings.set_value(
                `command${rowNumber}`,
                new GLib.Variant('(sssb)', [
                    name,
                    entryRowCommand.text,
                    icon,
                    visible,
                ])
            );           
        });
        
        entryRowIcon.connect('notify::text', () => {
            const [name, command, , visible] = this._settings.get_value(`command${rowNumber}`).deep_unpack();
            this._settings.set_value(
                `command${rowNumber}`,
                new GLib.Variant('(sssb)', [
                    name,
                    command,
                    entryRowIcon.text,
                    visible,
                ])
            );
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
            draggedRow = row;
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
        this._expanderRows.length = 0;
        const commandBoxTarget = Gtk.DropTarget.new(Gtk.ListBoxRow, Gdk.DragAction.MOVE);
        this._commandBoxList.add_controller(commandBoxTarget);
        this._commandBoxList.set_vexpand(false);

        let savedOrder = [];
        try {
            savedOrder = this._settings.get_value('command-order').deep_unpack();
        } catch (e) {
            console.log('[Custom Command Menu] Failed to read command-order from settings:', e);
        }

        if (!Array.isArray(savedOrder) || savedOrder.length !== numberOfCommands) {
            console.log('[Custom Command Menu] Invalid savedOrder array');
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
        buttonBox.append(icon);
        
        this._addCommandButton.set_child(buttonBox);

        const clickGesture = new Gtk.GestureClick();
        clickGesture.connect('released', () => {
            let inserted = false;
            for (const child of this._commandBoxList) {
                if (child instanceof Adw.ExpanderRow && !child.visible) {

                    this._settings.set_value(`command${child._rowNumber}`, new GLib.Variant('(sssb)', ["", "", "", true]));

                    child._checkButton.get_child().set_from_icon_name("checkbox-checked-symbolic");
                    child.remove_css_class('dim-label');

                    this._commandBoxList.remove(child);
                    const index = Array.from(this._commandBoxList).indexOf(this._addCommandButton);
                    this._commandBoxList.insert(child, index);
    
                    let order = this._settings.get_value('command-order').deep_unpack();
                    order = order.filter(n => n !== child._rowNumber);
                    order.push(child._rowNumber);
                    this._settings.set_value('command-order', new GLib.Variant('ai', order));
    
                    child.visible = true;
                    child.expanded = true;

                    inserted = true;
                    break;
                } 
            }
            if (!inserted) this._overlay.add_toast(new Adw.Toast({ title: _('Maximum row limit reached') }));
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

        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._refreshMenuTitles();
            return GLib.SOURCE_REMOVE;
        });
    }
    //#endregion initDragMenu


    //#region functions
    _onTargetDropped(_drop, value, _x, y, listbox) {
        const targetRow = listbox.get_row_at_y(y);
        if (!value || !targetRow || !draggedRow) return false;

        this._commandBoxList.drag_unhighlight_row();

        if (targetRow === draggedRow || targetRow === this._addCommandButton) return false;

        const children = Array.from(this._commandBoxList);
        const fromIndex = children.indexOf(draggedRow);
        const toIndex = children.indexOf(targetRow);
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return false;

        const adjustment = this._scroller.get_vadjustment();
        const scrollValue = adjustment.get_value();

        this._commandBoxList.remove(draggedRow);
        const adjustedIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
        this._commandBoxList.insert(draggedRow, adjustedIndex);

        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                adjustment.set_value(scrollValue);
                return GLib.SOURCE_REMOVE;
        });

        const clock = this._scroller.get_frame_clock?.();
        if (clock) {
            const handlerId = clock.connect('after-paint', () => {
                adjustment.set_value(scrollValue);
                clock.disconnect(handlerId);
            });
        }

        this._emitReorder();

        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._refreshMenuTitles();
            return GLib.SOURCE_REMOVE;
        });     

        draggedRow = null;
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
        this._expanderRows.length = 0;
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


    _showToast(message) {
        const toast = new Adw.Toast({ title: message });
        this._overlay.add_toast(toast);
    }


    _refreshMenuTitles() {
        const order = this._settings.get_value('command-order').deep_unpack();
        const separators = ['~~~', '---', '───'];

        function isSeparator(text) {
            if (!text) return false;
            text = text.trim();
            return separators.some(prefix => 
                text === prefix || (text.startsWith(prefix) && text.length > prefix.length)
            );
        }

        for (let i = 0; i < order.length; i++) {
            const n = order[i];
            if (n < 1 || n > numberOfCommands) continue;

            const row = Array.from(this._commandBoxList).find(r => r._rowNumber === n);
            if (!row) continue;

            if (row._entryRowName) row._entryRowName.title = _('Name:');
            if (row._entryRowName) row._entryRowName.show();
            if (row._entryRowCommand) row._entryRowCommand.show();
            if (row._entryRowIcon) row._entryRowIcon.show();

            const text = row._entryRowName.text;
            row.title = text.replace(/&/g, '&amp;');

            if (isSeparator(text)) {
                row._entryRowCommand.hide();
                row._entryRowIcon.hide();
                row._entryRowName.title = _('Separator Row');
                continue;
            } 

            if (!this._settings.get_value(`command${n}`).deep_unpack()[3]) continue;

            const [entryA, entryB, entryC] = this._settings.get_value(`command${n}`).deep_unpack().slice(0, 3).map(s => s.trim());

            if (entryA === '' && entryB === '' && entryC === '') continue;

            if (!entryA.startsWith('*')) {
                let nextValid = null;

                for (let j = i + 1; j < order.length; j++) {
                    const nextRowNum = order[j];

                    if (nextRowNum < 1 || nextRowNum > numberOfCommands) continue;
                    if (!this._settings.get_value(`command${nextRowNum}`).deep_unpack()[3]) continue;

                    const [nextA, nextB, nextC] = this._settings.get_value(`command${nextRowNum}`).deep_unpack().slice(0, 3).map(s => s.trim());
                    if (nextA === '' && nextB === '' && nextC === '') continue;

                    nextValid = nextA;
                    break;
                }

                if (nextValid?.startsWith('*')) {
                    row._entryRowName.title = _('Submenu Title:');
                    row._entryRowCommand.hide();
                    row._entryRowIcon.hide();
                }
            }
        }
    }

    
    collapseAll() {
        for (const row of this._expanderRows) row.expanded = false;
    }
    //#endregion functions
}
