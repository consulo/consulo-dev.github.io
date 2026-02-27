---
title: Action System
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

## Introduction
The actions system is an extension point that allows plugins to add their items to Consulo-based IDE menus and toolbars.
For example, one of the action classes is responsible for the **File \| Open File...** menu item and the **Open File** toolbar button.

Actions in the Consulo require a [code implementation](#action-implementation) and must be [registered](#registering-actions).
The action implementation determines the contexts in which an action is available, and its functionality when selected in the UI.
Registration determines where an action appears in the IDE UI.
Once implemented and registered, an action receives callbacks from the Consulo in response to user gestures.

The [Creating Actions](/tutorials/action_system/working_with_custom_actions.md) tutorial describes the process of adding a custom action to a plugin.
The [Grouping Actions](/tutorials/action_system/grouping_action.md) tutorial demonstrates three types of groups that can contain actions.
The rest of this page is an overview of actions as an extension point.


## Action Implementation
An action is a class derived from the abstract class [`AnAction`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java).
The Consulo calls methods of an action when a user interacts with a menu item or toolbar button.

::: warning
Classes based on `AnAction` do not have class fields of any kind.
This is because an instance of `AnAction` class exists for the entire lifetime of the application.
If the `AnAction` class uses a field to store data that has a shorter lifetime and doesn't clear this data promptly, the data leaks.
For example, any `AnAction` data that exists only within the context of a [`Project`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/Project.java) causes the `Project` to be kept in memory after the user has closed it.
:::


### Principal Implementation Overrides
Every Consulo action should override [`AnAction.update()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) and must override [`AnAction.actionPerformed()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java).
* An action's method [`AnAction.update()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) is called by the Consulo framework to update an action state.
  The state (enabled, visible) of an action determines whether the action is available in the UI of an IDE.
  An object of the [`AnActionEvent`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnActionEvent.java) type is passed to this method and contains information about the current context for the action.
  Actions are made available by changing state in the [`Presentation`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/Presentation.java) object associated with the event context.
  As explained in [Overriding the `AnAction.update()`  Method](#overriding-the-anactionupdate-method), it is vital `update()` methods _execute quickly_ and return execution to the Consulo.
* An action's method [`AnAction.actionPerformed()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) is called by the Consulo if available and selected by the user.
  This method does the heavy lifting for the action - it contains the code executed when the action gets invoked.
  The `actionPerformed()` method also receives `AnActionEvent` as a parameter, which is used to access projects, files, selection, etc.
  See [Overriding the `AnAction.actionPerformed()` Method](#overriding-the-anactionactionperformed-method) for more information.

There are other methods to override in the `AnAction` class, such as changing the default `Presentation` object for the action.
There is also a use case for overriding action constructors when registering them with dynamic action groups, demonstrated in the [Grouping Actions](/tutorials/action_system/grouping_action.md#adding-child-actions-to-the-dynamic-group) tutorial.
However, the `update()` and `actionPerformed()` methods are essential to basic operation.

### Overriding the AnAction.update Method
The method [`AnAction.update()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) is periodically called by the Consulo in response to user gestures.
The `update()` method gives an action to evaluate the current context and enable or disable its functionality.

::: warning
The [`AnAction.update()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) method can be called frequently and on a UI thread.
:::

This method needs to _execute very quickly_; no real work should be performed in this method.
For example, checking selection in a tree or a list is considered valid, but working with the file system is not.

::: tip
If the new state of an action cannot be determined quickly, then evaluation should be performed in the [`AnAction.actionPerformed()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) method, and notify the user that the action cannot be executed if the context isn't suitable.
:::


#### Determining the Action Context
The `AnActionEvent` object passed to `update()` carries information about the current context for the action.
Context information is available from the methods of `AnActionEvent`, providing information such as the Presentation and whether the action is triggered by a Toolbar.
Additional context information is available using the method [`AnActionEvent.getData()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnActionEvent.java).
Keys defined in [`CommonDataKeys`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/CommonDataKeys.java) are passed to the `getData()` method to retrieve objects such as `Project`, [`Editor`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/Editor.java), [`PsiFile`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiFile.java), and other information.
Accessing this information is relatively light-weight and is suited for [`AnAction.update()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java).

#### Enabling and Setting Visibility for an Action
Based on information about the action context, the [`AnAction.update()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) method can enable, disable, or hide an action.
An action's enable/disable state and visibility are set using methods of the `Presentation` object, which is accessed using [`AnActionEvent.getPresentation()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnActionEvent.java).

The default `Presentation` object is a set of descriptive information about a menu or toolbar action.
Every context for an action - it might appear in multiple menus, toolbars, or Navigation search locations - has a unique presentation.
Attributes such as an action's text, description, and icons and visibility and enable/disable state, are stored in the presentation.
The attributes in a presentation get initialized from the [action registration](#registering-actions).
However, some can be changed at runtime using the methods of the `Presentation` object associated with an action.

The enabled/disabled state of an action is set using [`Presentation.setEnabled()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/Presentation.java).
The visibility state of an action is set using [`Presentation.setVisible()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/Presentation.java)
If an action is enabled, the [`AnAction.actionPerformed()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) can be called if an action is selected in the IDE by a user.
A menu action shows in the UI location specified in the registration.
A toolbar action displays its enabled (or selected) icon, depending on the user interaction.

When an action is disabled [`AnAction.actionPerformed()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) will not be called.
Toolbar actions display their respective icons for the disabled state.
The visibility of a disabled action in a menu depends on whether the host menu (e.g., "ToolsMenu") containing the action has the `compact` attribute set.
See [Grouping Actions](#grouping-actions) for more information about the `compact` attribute and menu actions' visibility.

::: info
If an action is added to a toolbar, its `update()` can be called if there was any user activity or focus transfer.
:::

If the action's availability changes in the absence of these events, then call [`ActivityTracker.getInstance().inc()`](https://github.com/consulo/consulo/blob/master/modules/base/application-impl/src/main/java/consulo/application/impl/internal/performance/ActivityTracker.java) to notify the action subsystem to update all toolbar actions.

An example of enabling a menu action based on whether a project is open is demonstrated in the `PopupDialogAction.update()` method. See the Consulo plugin template for examples.

### Overriding the AnAction.actionPerformed Method
When the user selects an enabled action, be it from a menu or toolbar, the action's [`AnAction.actionPerformed()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) method is called.
This method contains the code executed to perform the action, and it is here that the real work gets done.

By using the `AnActionEvent` methods and `CommonDataKeys`, objects such as the `Project`, `Editor`, `PsiFile`, and other information is available.
For example, the `actionPerformed()` method can modify, remove, or add PSI elements to a file open in the editor.

The code that executes in the [`AnAction.actionPerformed()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) method should execute efficiently, but it does not have to meet the same stringent requirements as the `update()` method.

An example of inspecting PSI elements is demonstrated in the SDK code sample `action_basics` `PopupDialogAction.actionPerformed()` method. See the Consulo plugin template for examples.

### Action IDs
Every action and action group has a unique identifier.
Basing the identifier for a custom action on the FQN of the implementation is the best practice, assuming the package incorporates the `<id>` of the plugin.
An action must have a unique identifier for each place.
It is used in the IDE UI, even though the FQN of the implementation is the same.
Definitions of identifiers for the standard Consulo actions are in [`IdeActions`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/IdeActions.java).

### Grouping Actions
Groups organize actions into logical UI structures, which in turn can contain other groups.
A group of actions can form a toolbar or a menu.
Subgroups of a group can form submenus of a menu.

Actions can be included in multiple groups, and thus appear in different places within the IDE UI.
An action must have a unique identifier for each place it appears in the IDE UI.
See the [@ActionImpl Annotation Reference](#actionimpl-annotation-reference) section for information about how to specify locations in the IDE UI.

#### Presentation
A new `Presentation` gets created for every place where the action appears.
Therefore, the same action can have different text or icons when it appears in different places of the user interface.
Different presentations for the action are created by copying the Presentation returned by the [`AnAction.getTemplatePresentation()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) method.

#### Compact Attribute
A group's "compact" attribute specifies whether an action within that group is visible when disabled.
See [Registering Actions with @ActionImpl](#registering-actions-with-actionimpl) for more information about group registration.
If the `compact` attribute is `true` for a menu group, an action in the menu only appears if its state is both enabled and visible.
In contrast, if the `compact` attribute is `false`, an action in the menu appears if its state is disabled but visible.
Some menus like **Tools** have the `compact` attribute set, so there isn't a way to show an action on the tools menu if it is not enabled.

| Host Menu<br>`compact` Setting | Action Enabled | Visibility Enabled | Menu Item Visible? | Menu Item Appears Gray? |
| :-----: | :------------: | :----------------: | :----------------: | :---------------------: |
|    T    |     **F**      |         T          |      **F**         |         N/A             |
|    T    |       T        |         T          |        T           |         F               |
|    F    |     **F**      |         T          |      **T**         |       **T**             |
|    F    |       T        |         T          |        T           |         F               |

All other combinations of `compact`, visibility, and enablement produce N/A for gray appearance because the menu item isn't visible.

See the [Grouping Actions](/tutorials/action_system/grouping_action.md) tutorial for examples of creating action groups.

## Registering Actions
There are two main ways to register an action: either by annotating the action class with `@ActionImpl` or through code.

### Registering Actions with @ActionImpl
Actions are registered using the `@ActionImpl` annotation directly on the action class. This annotation-based approach replaces the older XML-based `<actions>` section in `plugin.xml`. The `@ActionImpl` annotation and its related types are used to declare the action's ID, parent groups, child actions, shortcuts, and other metadata.

#### Setting Override Text

An alternate version of an action's menu text can be provided depending on where an action appears.
The menu text for an action can be different depending on context: menu location, toolbar, etc.

For example, an action might have a default text "Garbage Collector: Collect _Garbage" but display a shorter "Collect _Garbage" when shown in the Main Menu.
A different context, such as searching for the action using **Help \| Find Action...**, displays the default longer text to give the user additional information about the action.

Override text can be configured through the [localize system](/platform/ui/localization.md) or by overriding the action's `Presentation` in the `update()` method.
                             
#### Setting Synonyms
Users can locate actions via their name by invoking **Help \| Find Action**.

To allow using alternative names in search, synonyms can be provided through the [localize system](/platform/ui/localization.md) or programmatically.
                             
#### Disabling Search for Group
_2020.3_
To exclude a group from appearing in **Help \| Find Action** results (e.g., _New..._ popup), specify `searchable="false"`.

#### Localizing Actions and Groups
Consulo uses the [localize system](/platform/ui/localization.md) (LOCALIZE-LIB with YAML files and generated Localize classes) for action and group localization, rather than Java resource bundles.

When localizing actions and groups, text and description are provided via generated `Localize` classes rather than hardcoding strings in the action constructor.
Pass [`LocalizeValue`](https://github.com/consulo/consulo/blob/master/modules/base/localize-api/src/main/java/consulo/localize/LocalizeValue.java) instances from the generated Localize class to the `AnAction` constructor:

```java
public class PopupDialogAction extends AnAction {
    public PopupDialogAction() {
        super(MyPluginLocalize.popupDialogActionText(),
              MyPluginLocalize.popupDialogActionDescription(),
              icon);
    }
}
```

See [Localization](/platform/ui/localization.md) for details on defining localize entries and generating Localize classes.

See [Extending DefaultActionGroup](/tutorials/action_system/grouping_action.md#extending-defaultactiongroup) for a tutorial of localizing Actions and Groups.

#### @ActionImpl Annotation Reference
The places where actions can appear are defined by constants in [`ActionPlaces`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/ActionPlaces.java).
Group IDs for the Consulo are defined in the platform action definitions.

This, and additional information can also be found by using the Code Completion, Quick Definition, and Quick Documentation features in Consulo.

::: tip
To lookup existing Action ID (e.g. for use in `relatedToAction`), [UI Inspector](/reference_guide/internal_actions/internal_ui_inspector.md) can be used.
:::


The `@ActionImpl` annotation is placed on action or group classes to register them with the Consulo framework. Below is the complete reference for all annotation parameters:

**`@ActionImpl` Parameters:**
* `id` (required) - A unique identifier for the action. Best practice is to base this on the FQN of the implementation class, incorporating the plugin's `<id>`.
* `parents` - An array of `@ActionParentRef` specifying which groups the action should be added to. An action can be added to several groups.
* `children` - An array of `@ActionRef` specifying child actions within a group. Used when the annotated class is a `DefaultActionGroup`.
* `shortcutFrom` - An array of `@ActionRef` specifying actions whose keyboard shortcuts this action will reuse.
* `profiles` - `ComponentProfiles` specifying the component profiles for the action.

**`@ActionParentRef` Parameters:**
* `value` (required) - An `@ActionRef` identifying the parent group (by `id` or `type`).
* `anchor` - An `ActionRefAnchor` value specifying the position relative to other actions. Values: `BEFORE`, `AFTER`, `FIRST`, `LAST`.
* `relatedToAction` - An `@ActionRef` identifying the action before or after which this action is inserted. Required when `anchor` is `BEFORE` or `AFTER`.

**`@ActionRef` Parameters:**
* `id` - The string ID of an existing action or group.
* `type` - The class of an action. Use either `id` or `type`, not both.

##### Registering an Action

```java
// Register a simple action in the Tools menu, positioned after GenerateJavadoc
@ActionImpl(id = "VssIntegration.GarbageCollection",
    parents = @ActionParentRef(
        value = @ActionRef(id = "ToolsMenu"),
        anchor = ActionRefAnchor.AFTER,
        relatedToAction = @ActionRef(id = "GenerateJavadoc")
    ))
public class CollectGarbage extends AnAction {

    public CollectGarbage() {
        super("Garbage Collector: Collect _Garbage", "Run garbage collector", Icons.Garbage);
    }

    @Override
    public void update(@NotNull AnActionEvent e) {
        // ...
    }

    @Override
    public void actionPerformed(@NotNull AnActionEvent e) {
        // ...
    }
}
```

##### Registering an Action Using Localization

When using the [localize system](/platform/ui/localization.md), pass `LocalizeValue` instances from the generated Localize class to the action constructor:

```java
@ActionImpl(id = "sdk.action.PopupDialogAction",
    parents = @ActionParentRef(value = @ActionRef(id = "ToolsMenu"), anchor = ActionRefAnchor.FIRST))
public class PopupDialogAction extends AnAction {
    public PopupDialogAction() {
        // text and description provided via generated Localize class
        super(MyPluginLocalize.popupDialogActionText(),
              MyPluginLocalize.popupDialogActionDescription(),
              SdkIcons.Sdk_default_icon);
    }
}
```

##### Registering an Action Group

Action groups are registered by annotating a `DefaultActionGroup` subclass (or `DefaultActionGroup` itself) with `@ActionImpl`.
The `children` parameter declares the static child actions within the group:

```java
// Register a group with child actions, placed before HelpMenu in the MainMenu
@ActionImpl(id = "TestActionGroup",
    parents = @ActionParentRef(
        value = @ActionRef(id = "MainMenu"),
        anchor = ActionRefAnchor.BEFORE,
        relatedToAction = @ActionRef(id = "HelpMenu")
    ),
    children = {
        @ActionRef(type = TestAction.class),
        @ActionRef(type = TestActionSubGroup.class),
        @ActionRef(id = "EditorCopy")
    })
public class MyActionGroup extends DefaultActionGroup {
    // Group implementation...
}
```

##### Reusing Keyboard Shortcuts

To reuse the keyboard shortcuts of another action, use the `shortcutFrom` parameter:

```java
@ActionImpl(id = "MyAction",
    parents = @ActionParentRef(value = @ActionRef(id = "ToolsMenu")),
    shortcutFrom = @ActionRef(id = "AnotherAction"))
public class MyAction extends AnAction {
    // This action will use the same keyboard shortcuts as "AnotherAction"
}
```

### Registering Actions from Code
Two steps are required to register an action from code:
* First, an instance of the class derived from `AnAction` must be passed to the `registerAction()` method of [`ActionManager`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/ActionManager.java), to associate the action with an ID.
* Second, the action needs to be added to one or more groups.
  To get an instance of an action group by ID, it is necessary to call [`ActionManager.getAction()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/ActionManager.java) and cast the returned value to [`DefaultActionGroup`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/DefaultActionGroup.java).

## Building UI from Actions
If a plugin needs to include a toolbar or popup menu built from a group of actions in its user interface, that is accomplished through [`ActionPopupMenu`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/ActionPopupMenu.java) and `ActionToolbar`.
These objects can be created through calls to the [`ActionManager.createActionPopupMenu()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/ActionManager.java) and `createActionToolbar()` methods.
To get a Swing component from such an object, call the respective `getComponent()` method.

If an action toolbar is attached to a specific component (for example, a panel in a tool window), call [`ActionToolbar.setTargetComponent()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/ActionToolbar.java) and pass the related component's instance as a parameter.
Setting the target ensures that the toolbar buttons' state depends on the state of the related component, not on the current focus location within the IDE frame.

See the Toolbar section in _Consulo UI Guidelines_ for an overview.
