---
title: User Interface Components
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The Consulo includes a large number of custom Swing components.
Using those components in your plugins will ensure that your plugin looks and works consistently with the UI of the rest of the IDE, and can often reduce the code size compared to using the default Swing components.

> **TIP** Use [UI Inspector](/reference_guide/internal_actions/internal_ui_inspector.md) to locate the underlying Swing component implementation or to inspect an existing UI at runtime.

Please refer to [Writing short and clear](https://jetbrains.design/intellij/text/writing_short/) in _Consulo UI Guidelines_ on writing UI-related texts.

The following components are particularly noteworthy:

*  Menus and toolbars are built using the [Action System](/basics/action_system.md)
*  [Tool Windows](/user_interface_components/tool_windows.md)
*  [Dialogs](/user_interface_components/dialog_wrapper.md)
*  [Popups](/user_interface_components/popups.md)
*  [Notifications](/user_interface_components/notifications.md)
*  [File and Class Choosers](/user_interface_components/file_and_class_choosers.md)
*  [Editor Components](/user_interface_components/editor_components.md)
*  [List and Tree Controls](/user_interface_components/lists_and_trees.md)
*  Tables (TableView) (TBD)
*  Drag & Drop Helpers (TBD)
*  [Miscellaneous Swing Components](/user_interface_components/misc_swing_components.md)
    *  Messages
    *  JBSplitter
    *  JBTabs
