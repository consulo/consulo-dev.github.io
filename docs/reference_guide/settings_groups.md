---
title: Custom Settings Groups
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

As described in [Registering Settings](settings_guide.md#registering-settings), custom _Settings_ can be declared as children of existing parent groups such as `tools`.
These parent groups are the existing categories of Settings in the Consulo-based IDE.

However, suppose the custom Settings are rich enough to require multiple levels?
For example, a custom Setting implementation has multiple sub-Settings implementations.
The `getParentId()` method can create this kind of multilayer Settings hierarchy.

* bullet list
{:toc}

## Parent-Child Settings Relationships Using `getParentId()`
Parent-child relationships in groups of Settings are established by having the child's `getParentId()` method return the `getId()` value of the parent.

> **NOTE** An application configurable can be a parent of a project configurable.

Each Settings implementation is a separate class annotated with `@ExtensionImpl`. The parent-child relationship is defined by the return value of `getParentId()` in the child class, which should match the `getId()` of the parent.

### Parent-Child Settings Example
To declare a parent-child relationship, create separate Settings classes where the child's `getParentId()` returns the parent's `getId()`.
This approach works regardless of whether the parent Settings class is in the same plugin.
If the `getId()` of the parent is known, a plugin can add Settings as a child of that parent.

For example, below are two Settings classes for project-level Settings.
The first gets added to the `tools` group, and the second gets added as a child of the first by returning the parent's `getId()` from `getParentId()`.

```java
@ExtensionImpl
public class TaskConfigurable implements ProjectConfigurable {
    @Nonnull
    @Override
    public String getId() {
        return "consulo.sdk.tasks";
    }

    @Nullable
    @Override
    public String getParentId() {
        return "tools";
    }

    @Nls
    @Override
    public String getDisplayName() {
        return "Tasks";
    }

    // ... createComponent(), isModified(), apply(), reset() ...
}

@ExtensionImpl
public class TaskRepositoriesConfigurable implements ProjectConfigurable {
    @Nonnull
    @Override
    public String getId() {
        return "consulo.sdk.tasks.servers";
    }

    @Nullable
    @Override
    public String getParentId() {
        return "consulo.sdk.tasks";
    }

    @Nls
    @Override
    public String getDisplayName() {
        return "Servers";
    }

    // ... createComponent(), isModified(), apply(), reset() ...
}
```

See the [ID Conventions for Parent-Child Settings](#id-conventions-for-parent-child-settings) section for details about compound IDs.

### ID Conventions for Parent-Child Settings
The other methods are the same as discussed in [Settings Declaration Methods](settings_guide.md#settings-declaration-methods).

For the child of a parent, the `getId()` return value should follow a compound convention:

| Method | Required | Value |
|:---   |  :---:  |:---  |
| `getId()` | Y | Compound FQN of implementation based on [`consulo.configurable.Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) in the form: `XX.YY` where:<br>`XX` is the parent Settings component FQN-based id.<br>`YY` is unique to the child among other siblings.  |

> **TIP** All children share the parent's `getId()` as the basis of their own `getId()`.
> All children have an `getId()` suffix that is unique among their siblings.

## Implementations for Parent-Child Settings
Implementations can be based on [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java), `ConfigurableProvider` or one of their subtypes.
For more information about creating Settings implementations, see [Implementations for Settings Extension Points](settings_guide.md#implementations-for-settings-extension-points).

### Configurable Marker Interfaces
The `Configurable.Composite` interface indicates a configurable component has child components.
The preferred approach is to specify child components using [separate `@ExtensionImpl` classes with `getParentId()`](#parent-child-settings-relationships-using-getparentid).
Using the `Composite` interface incurs the penalty of loading child classes while building the tree of Settings Swing components.
