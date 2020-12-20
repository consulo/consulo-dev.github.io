---
title: Internal Actions - UI Inspector

redirect_from:
  - /reference_guide/internal_actions/internal_uii.html
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The _UI Inspector_ is a tool to interrogate elements of the IntelliJ IDEA UI to get an internal description of each element.
UI elements can be tested interactively by clicking on the element while the _UI Inspector_ is enabled.

If the menu item **Tools \| Internal Actions \| UI \| UI Inspector** is not available in IntelliJ IDEA, then the first step is to [enable internal mode](enabling_internal.md)

## Enabling the UI Inspector
Before using the _UI Inspector_, it must be enabled by selecting the menu item **Tools \| Internal Actions \| UI \| UI Inspector**.
The enabled state of the _UI Inspector_ is modal; it remains enabled until it is disabled by selecting the _UI Inspector_ menu item again.

## Using the UI Inspector
While enabled, centering the cursor on a UI element and pressing <kbd>Control/Cmd</kbd>+<kbd>Alt</kbd> when _clicking_ the mouse reveals the properties of the Swing component.

For example, to get information about the _Build Project_ button's icon (hammer) on the toolbar (highlighted in green), put the mouse cursor on the icon and press <kbd>Control/Cmd</kbd>+<kbd>Alt</kbd> while clicking the mouse.

The _UI Inspector_ displays that the icon has the internal path `AllIcons.Actions.Compile`:

![Internal Icon Info](img/internal_uii_icon_info.png)

## Additional Properties
Various components used in the IntelliJ Platform expose additional properties.
These can be useful to locate the underlying implementation, related Action, etc.

| Type                                            | Place                      | Properties                                                                                                                   |
| ----------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [`AnAction`][ActionSystem]                      | Action Button<br>Menu Item | `Action` - [`AnAction`][us:AnAction] implementation<br>`Action ID` - Action `id`<br>`Action Plugin ID` - contributing plugin |
| [`ActionToolbar`][ActionSystem]                 | Action Toolbar             | `Toolbar Group` - Action Group ID<br>`All Groups` - contained Action Group IDs                                               |
| [`DialogWrapper`][DialogWrapper]                | Modal Dialog               | `dialogWrapperClass` - [`DialogWrapper`][us:DialogWrapper] implementation                                                    |
| [`GutterMark`][us:GutterMark]                   | Editor Gutter Icon         | `gutter renderer` - [`GutterMark`][us:GutterMark] implementation                                                             |
| [`IntentionAction`/`QuickFix`][IntentionAction] | Popup Menu in Editor       | `intention action`/`quick fix` - [`IntentionAction`][us:IntentionAction] / [`QuickFix`][us:QuickFix] implementation          |
| [`Tree`][Tree]                                  | Tree                       | `treeModelClass` - `javax.swing.tree.TreeModel` implementation                                                               |

[ActionSystem]: /basics/action_system.md
[DialogWrapper]: /user_interface_components/dialog_wrapper.md
[Tree]: /user_interface_components/lists_and_trees.md
[IntentionAction]: /reference_guide/custom_language_support/code_inspections_and_intentions.md
[us:AnAction]: upsource:///platform/editor-ui-api/src/com/intellij/openapi/actionSystem/AnAction.java
[us:GutterMark]: upsource:///platform/editor-ui-api/src/com/intellij/codeInsight/daemon/GutterMark.java
[us:DialogWrapper]: upsource:///platform/platform-api/src/com/intellij/openapi/ui/DialogWrapper.java
[us:IntentionAction]: upsource:///platform/analysis-api/src/com/intellij/codeInsight/intention/IntentionAction.java
[us:QuickFix]: upsource:///platform/analysis-api/src/com/intellij/codeInspection/QuickFix.java

Custom Swing components can also provide additional properties via [`UiInspectorContextProvider`](upsource:///platform/platform-impl/src/com/intellij/internal/inspector/UiInspectorContextProvider.java) (2020.1 and later).
