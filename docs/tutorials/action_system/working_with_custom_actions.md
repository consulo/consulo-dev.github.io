---
title: Creating Actions
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

## Introduction
Plugins can add actions to existing IDE menus and toolbars, as well as add new menus and toolbars.
The Consulo calls the actions of plugins in response to user interactions with the IDE.
However, the actions of a plugin must first be defined and registered with the Consulo.

Using the SDK code sample `action_basics`, this tutorial illustrates the steps to create an action for a plugin.

* bullet list
{:toc}

## Creating a Custom Action
Custom actions extend the abstract class [`AnAction`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java).
Classes that extend it should override [`AnAction.update()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java), and must override [`AnAction.actionPerformed()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java).
* The `update()` method implements the code that enables or disables an action.
* The `actionPerformed()` method implements the code that executes when an action is invoked by the user.

As an example, `PopupDialogAction` overrides [`AnAction`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) for the `action_basics` code sample.

```java
public class PopupDialogAction extends AnAction {

  @Override
  public void update(AnActionEvent e) {
    // Using the event, evaluate the context, and enable or disable the action.
  }

  @Override
  public void actionPerformed(@NotNull AnActionEvent e) {
    // Using the event, implement an action. For example, create and show a dialog.
  }

}
```

> **WARNING** [`AnAction`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) classes do not have class fields of any kind.
> This restriction prevents memory leaks.
> For more information about why, see [Action Implementation](/basics/action_system.md#action-implementation).

At this stage, `update()` implicitly defaults always to enable this action.
The implementation of `actionPerformed()` does nothing.
These methods fully implemented in [Developing the AnAction Methods](#developing-the-anaction-methods) below.

Before fleshing out those methods, to complete this minimal implementation, `PopupDialogAction` must be registered with the Consulo.

## Registering a Custom Action
Actions are registered by annotating the action class with the `@ActionImpl` annotation.
This section describes how to register `PopupDialogAction` using `@ActionImpl` and configure its registration parameters.
A more comprehensive explanation of action registration is available in the [Action Registration](/basics/action_system.md#registering-actions) section of this guide.

### Registering an Action with @ActionImpl
To register `PopupDialogAction`, annotate the class with `@ActionImpl`. The annotation parameters specify the action's unique ID and where it appears in the IDE UI.

The key parameters for basic registration are:
* `id` - Every action must have a unique ID. If the action class is used in only one place in the IDE UI, then the class FQN is a good default for the ID. Using the action class in multiple places requires a different ID for each use.
* The annotated class itself serves as the implementation class.
* `parents` - The action group (menu or toolbar) to which the action is added, along with positioning information.

In this case, `PopupDialogAction` will be available in the **Tools** menu, placed at the top:

```java
@ActionImpl(id = "org.intellij.sdk.action.PopupDialogAction",
    parents = @ActionParentRef(value = @ActionRef(id = "ToolsMenu"), anchor = ActionRefAnchor.FIRST))
public class PopupDialogAction extends AnAction {

    public PopupDialogAction() {
        super("Pop Dialog Action", "SDK action example", SdkIcons.Sdk_default_icon);
    }

    @Override
    public void update(AnActionEvent e) {
        // Using the event, evaluate the context, and enable or disable the action.
    }

    @Override
    public void actionPerformed(@NotNull AnActionEvent e) {
        // Using the event, implement an action. For example, create and show a dialog.
    }
}
```

The `@ActionImpl` annotation declares the _Action ID_ (`id`) and the class itself provides the implementation.
The `@ActionParentRef` declares where the action will appear: in the `ToolsMenu` group, at the first position.

This registration is adequate, but adding more parameters is discussed in the next section.

### Configuring Additional @ActionImpl Parameters
An exhaustive list of `@ActionImpl` parameters is presented in the [@ActionImpl Annotation Reference](/basics/action_system.md#actionimpl-annotation-reference).

The full `@ActionImpl` registration for `PopupDialogAction` in the `action_basics` code sample includes an [`Icon`](/reference_guide/work_with_icons_and_images.md), text, description, and shortcut reuse configuration:

```java
@ActionImpl(id = "org.intellij.sdk.action.PopupDialogAction",
    parents = @ActionParentRef(value = @ActionRef(id = "ToolsMenu"), anchor = ActionRefAnchor.FIRST))
public class PopupDialogAction extends AnAction {

    public PopupDialogAction() {
        super("Action Basics Plugin: Pop Dialog Action", "SDK action example", SdkIcons.Sdk_default_icon);
    }

    // ... update() and actionPerformed() methods
}
```

#### Using Override Text for an Action
The action text can be different depending on the context of where the action appears: menu, toolbar, etc.
For example, the constructor sets the longer text "Action Basics Plugin: Pop Dialog Action" as the default. Override text such as the shorter "Pop Dialog Action" for the Main Menu context can be configured through localization resource bundles or by customizing the `Presentation` in the `update()` method.
For more information, see [Setting Override Text](/basics/action_system.md#setting-override-text)

## Testing the Minimal Custom Action Implementation
After performing the steps described above, compile and run the plugin to see the newly created action available as a Tools Menu item, which is within the context of the Main Menu:

!["Register action"](img/tools_menu_item_action.png){:width="350px"}

To see the alternate, more verbose text configured via override text, use **Help \| Find Action...** and search for "Pop Dialog Action".
The search shows the verbose menu text in a context outside of the Main Menu:

!["Override Text Display"](img/find_action.png){:width="500px"}

Selecting the action from the menu, keyboard/mouse shortcuts, or Find Action won't do anything at this point because the implementations are empty.
However, it confirms the new entry appears at **Tools \| Pop Dialog Action** and **Help \| Find Action...**.

## Developing the [`AnAction`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) Methods
At this point, the new action `PopupDialogAction` is registered with the Consulo and functions in the sense that  `update()` and `actionPerformed()` are called in response to user interaction with the IDE Tools menu.
However, neither method implements any code to perform useful work.

This section describes adding useful code to these methods.
The `update()` method defaults to always enable the action, which is satisfactory for intermediate testing.
So `actionPerformed()` will be developed first.

### Extending the `actionPerformed()` Method
Adding code to the `PopupDialogAction.actionPerformed()` method makes the action do something useful.
The code below gets information from the `anActionEvent` input parameter and constructs a message dialog.
A generic icon, and the `dlgMsg` and `dlgTitle` attributes from the invoking menu action are displayed.
However, code in this method could manipulate a project, invoke an inspection, change the contents of a file, etc.

For demonstration purposes the [`AnActionEvent.getData()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnActionEvent.java) method tests if a `Navigatable` object is available.
If so, information about the selected element is added to the dialog.

See [Determining the Action Context](/basics/action_system.md#determining-the-action-context) for more information about accessing information from the [`AnActionEvent`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnActionEvent.java) input parameter.

```java
  @Override
  public void actionPerformed(@NotNull AnActionEvent event) {
    // Using the event, create and show a dialog
    Project currentProject = event.getProject();
    StringBuffer dlgMsg = new StringBuffer(event.getPresentation().getText() + " Selected!");
    String dlgTitle = event.getPresentation().getDescription();
    // If an element is selected in the editor, add info about it.
    Navigatable nav = event.getData(CommonDataKeys.NAVIGATABLE);
    if (nav != null) {
      dlgMsg.append(String.format("\nSelected Element: %s", nav.toString()));
    }
    Messages.showMessageDialog(currentProject, dlgMsg.toString(), dlgTitle, Messages.getInformationIcon());
  }
```

### Extending the `update()` Method
Adding code to `PopupDialogAction.update()` gives finer control of the action's visibility and availability.
The action's state and(or) presentation can be dynamically changed depending on the context.

> **WARNING** This method needs to _execute very quickly_.
> For more information about this constraint, see the warning in [Overriding the AnAction.update Method](/basics/action_system.md#overriding-the-anactionupdate-method).

In this example, the `update()` method relies on a [`Project`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/Project.java) object being available.
This requirement means the user must have at least one project open in the IDE for the `PopupDialogAction` to be available.
So the `update()` method disables the action for contexts where a [`Project`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/Project.java) object isn't defined.

The availability (enabled and visible) is set on the `Presentation` object.
Setting both the enabled state and visibility produces consistent behavior despite possible host menu settings, as discussed in [Grouping Actions](/basics/action_system.md#grouping-actions).

```java
  @Override
  public void update(AnActionEvent e) {
    // Set the availability based on whether a project is open
    Project project = e.getProject();
    e.getPresentation().setEnabledAndVisible(project != null);
  }
```

The `update()` method does not check to see if a `Navigatable` object is available before enabling `PopupDialogAction`.
This check is unnecessary because using the `Navigatable` object is opportunistic in `actionPerformed()`.
See [Determining the Action Context](/basics/action_system.md#determining-the-action-context) for more information about accessing information from the [`AnActionEvent`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnActionEvent.java) input parameter.

### Other Method Overrides
A constructor is overridden in `PopupDialogAction`, but this is an artifact of reusing this class for a dynamically created menu action.
Otherwise, overriding constructors for [`AnAction`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) is not required.

## Testing the Custom Action
After compiling and running the plugin project and invoking the action, the dialog will pop up:

![Action performed](img/action_performed.png){:width="800px"}
