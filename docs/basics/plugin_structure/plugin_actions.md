---
title: Plugin Actions
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The *Consulo* provides the concept of _actions_.
An action is a class derived from [`AnAction`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java), whose `actionPerformed()` method is called when its menu item or toolbar button is selected.

Actions are the most common way for a user to invoke the functionality of your plugin.
An action can be invoked from a menu or a toolbar, using a keyboard shortcut or the **Help \| Find Action...** lookup.

Actions are organized into groups, which, in turn, can contain other groups.
A group of actions can form a toolbar or a menu.
Subgroups of the group can form submenus of a menu.

The user can customize all registered actions via Menus and Toolbars settings.

## Registering Actions

Actions are registered using the `@ActionImpl` annotation.
The `id` parameter specifies a unique identifier for the action, and the `parents` parameter declares where the action appears in the menu hierarchy using `@ActionParentRef` and `@ActionRef`:

```java
@ActionImpl(id = "MyAction", parents = @ActionParentRef(@ActionRef(id = "ToolsMenu")))
public class MyAction extends AnAction {
    @Override
    public void actionPerformed(@Nonnull AnActionEvent e) {
        // action logic
    }
}
```

Action groups can use the `children` parameter of `@ActionImpl` to declare their child actions.

Please see [Action System](/basics/action_system.md) on how to create and register actions in the IDE.
