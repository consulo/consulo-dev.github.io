---
title: Settings Guide
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

_Settings_ persistently store states that control the behavior and appearance of Consulo-based IDEs.
On this page, the term "Settings" means the same as "Preferences" on some platforms.

Plugins can create and store Settings to capture their configuration in a way that uses the Consulo [Persistence Model](/basics/persisting_state_of_components.md).
The User Interface (UI) for these custom Settings can be added to the IDE Settings dialog.

Settings can affect different levels of scope.
This document describes adding custom Settings at the Project and Application (or Global, IDE) levels.


## Registering Settings
Custom Settings implementations are registered using the `@ExtensionImpl` annotation on the implementation class.
The base interface used depends on the level of the Settings.

Application and Project Settings typically provide an implementation based on the [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) interface because they do not have runtime dependencies.
See [Implementations for Settings Extension Points](#implementations-for-settings-extension-points) for more information.

### Declaring Application Settings
Settings at the Application level are registered by implementing `ApplicationConfigurable` (which is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`) and annotating your implementation class with `@ExtensionImpl`.

The settings metadata (such as the parent group, unique ID, and display name) is provided by implementing interface methods rather than XML attributes.

An example Application Settings declaration is shown below.
The implementation indicates the settings are a child of the `tools` settings group, the unique ID is the implementation FQN, and the (non-localized) title displayed to users is "My Application Settings".
See [Settings Declaration Methods](#settings-declaration-methods) for more information.
```java
@ExtensionImpl
public class ApplicationSettingsConfigurable implements ApplicationConfigurable {
    @Nonnull
    @Override
    public String getId() {
        return "org.company.ApplicationSettingsConfigurable";
    }

    @Nullable
    @Override
    public String getParentId() {
        return "tools";
    }

    @Nls
    @Override
    public String getDisplayName() {
        return "My Application Settings";
    }

    // ... createComponent(), isModified(), apply(), reset() ...
}
```

### Declaring Project Settings
Project level Settings are registered by implementing `ProjectConfigurable` (which is annotated with `@ExtensionAPI(ComponentScope.PROJECT)`) and annotating your implementation class with `@ExtensionImpl`.

An example Project Settings declaration is shown below.
Similar to the application setting example above, the settings metadata is provided through interface methods.
See [Settings Declaration Methods](#settings-declaration-methods) for details.
```java
@ExtensionImpl
public class ProjectSettingsConfigurable implements ProjectConfigurable {
    @Nonnull
    @Override
    public String getId() {
        return "org.company.ProjectSettingsConfigurable";
    }

    @Nullable
    @Override
    public String getParentId() {
        return "tools";
    }

    @Nls
    @Override
    public String getDisplayName() {
        return "My Project Settings";
    }

    // ... createComponent(), isModified(), apply(), reset() ...
}
```

### Settings Declaration Methods
Readers are encouraged to review the Javadoc comments for [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) because the method information applies to [`ConfigurableProvider`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/ConfigurableProvider.java) as well as [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java), as noted.
This section provides some additional clarification of those comments.

#### Table of Methods
The methods used to declare settings metadata for `ApplicationConfigurable` and `ProjectConfigurable` are in the table below:

| Method | Implementation<br>Basis | Required&ensp;&ensp; | Return Value |
| :---------- | :----- | :--------: |:------ |
| `getId()` | [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java)<br>[`ConfigurableProvider`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/ConfigurableProvider.java) | Y | The unique, FQN identifier for this implementation.<br>The FQN should be based on the plugin `id` to ensure uniqueness. |
| `getParentId()` | [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java)<br>[`ConfigurableProvider`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/ConfigurableProvider.java) | Y | This method is used to create a hierarchy of Settings. This component is declared one of the specified parent component's children. Typically used for placing a Settings panel within the Settings Dialog menu. Acceptable values for `getParentId()` are given in [Values for Parent ID](#values-for-parent-id). |
| `getDisplayName()` | [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java)<br>[`ConfigurableProvider`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/ConfigurableProvider.java) | Y | The Settings name visible to users, which is needed for the Settings dialog left-side menu. |

**Notes:**
Settings metadata that was previously declared as XML attributes is now provided by implementing the corresponding interface methods in your `ApplicationConfigurable` or `ProjectConfigurable` class.

#### Values for Parent ID
The table below shows the allowed values returned by `getParentId()`.
See the [previous section](#table-of-methods) for all supported methods.

| `parentId` Value | Group | Details |
| :--------------- | :---- | :------ |
|_default_ | `other`  | If `getParentId()` returns `null`, the component is added to the `other` Settings group. This is undesirable; see `other` group description.  |
|`appearance` | Appearance & Behavior | This child group contains Settings to personalize IDE appearance, such as: changing themes and font size. Also, it covers Settings to customize behavior such as keymaps, configuring plugins, and system Settings such as password policies, HTTP proxy, updates, and more.  |
|`build` | Build, Execution, Deployment |  Child group containing Settings to configure project integration with different build tools, modify the default compiler Settings, manage server access configurations, customize the debugger behavior, etc.  |
|`build.tools` | Build Integration | A subgroup of `build`. This subgroup configures project integration with build tools such as Maven, Gradle, or Gant. |
|`editor` | Editor | Child group containing Settings to personalize source code appearance, such as fonts, highlighting styles, indents, etc. It also contains Settings to customize the editor's appearance, such as line numbers, caret placement, tabs, source code inspections, setting up templates, and file encodings.  | |
|`language` | Languages and Frameworks | Child group containing Settings related to specific language frameworks and technologies used in the project. |
|`tools` | 3rd Party Settings | Child group containing Settings to configure integration with third-party applications, specify the SSH Terminal connection Settings, manage server certificates and tasks, configure diagrams layout, etc. |
|`root` | Super Parent | The invisible parent of all existing groups. Not used except for IDEs built on top of the Consulo, or extensive suites of Settings. You should not place settings in this group. |
|`other` | Catch-all | The Consulo no longer uses this group. Do not use this group. Use the `tools` group instead.  |
|`project` | Project-related Settings | The Consulo no longer uses this group. It was intended to store some project-related settings. Do not use this group. |


## Implementations for Settings Extension Points
Implementations for `ApplicationConfigurable` and `ProjectConfigurable` can have one of two bases:
* The [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) interface, which provides a named configurable component with a Swing form.
  Most Settings providers are based on the [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) interface or one of its sub- or supertypes.
* The [`ConfigurableProvider`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/ConfigurableProvider.java) class, which can hide a configurable component from the Settings dialog based on runtime conditions.

### The Configurable Interface
Many Settings implement [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) or one of its subtypes, such as [`SearchableConfigurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/SearchableConfigurable.java).
Readers are encouraged to review the Javadoc comments for [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java).

#### Constructors
Implementations must meet several requirements for constructors.
* Application Settings implementations, registered as `ApplicationConfigurable` with `@ExtensionImpl`, must have a default constructor with no arguments.
* Project Settings implementations, registered as `ProjectConfigurable` with `@ExtensionImpl`, must declare a constructor with a single argument of type `Project`.

For a [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) implementation correctly registered with `@ExtensionImpl`, the implementation's constructor is not invoked by the Consulo until a user chooses the corresponding Settings `displayName` in the Settings Dialog menu.

::: warning
The Consulo may instantiate a [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) implementation on a background thread, so creating Swing components in a constructor can degrade UI responsiveness.
:::


#### Consulo Interactions with Configurable
The instantiation of a generic [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) implementation is documented in the interface file.
A few high-level points are reviewed here:
* The [`Configurable.reset()`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) method is invoked immediately after [`Configurable.createComponent()`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java).
  Initialization of Setting values in the constructor or `createComponent()` is unnecessary.
* See the [Constructors](#constructors) section for information about when a Settings object is instantiated.
* Once instantiated, a [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) instance's lifetime continues regardless of whether the implementation's Settings are changed, or the user chooses a different entry on the Settings Dialog menu.
* A [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) instance's lifetime ends when **OK** or **Cancel** is selected in the Settings Dialog.
  An instance's [`Configurable.disposeUIResources()`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) is called when the Settings Dialog is closing.

To open Settings dialog or show specific `Configurable`, see `ShowSettingsUtil`.

#### Configurable Marker Interfaces
Implementations based on [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) can implement marker interfaces, which provide additional flexibility in the implementation.

The following nested interfaces are markers, which convey information about the form to the Consulo:
  * [`Configurable.NoScroll`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) - Notifies the Settings dialog not to add scroll bars to the form.
    By default, a plugin's Settings component is put into a scrollable pane.
    However, a Settings panel can have a `JTree`, which requires its own `JScrollPane`.
    So `NoScroll` interface should be used to remove the outer `JScrollPane`.
  * [`Configurable.NoMargin`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) - Notifies the Settings dialog not to add an empty border to the form.
    By default, an empty border is added for a plugin's Settings component.

#### Additional Interfaces Based on Configurable
There are classes in the Consulo specialized for particular types of Settings.
These subtypes are based on `consulo.configurable.ConfigurableEP`.
For example, **Settings/Preferences \| Editor \| General \|Appearance** allows adding Settings via `EditorSmartKeysConfigurableEP` and `consulo.editorSmartKeysConfigurable` EP.

### The ConfigurableProvider Class
The [`ConfigurableProvider`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/ConfigurableProvider.java) class only provides a [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) implementation if its runtime conditions are met.
The Consulo first calls the [`ConfigurableProvider.canCreateConfigurable()`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/ConfigurableProvider.java), which evaluates runtime conditions to determine if Settings changes make sense in the current context.
If the Settings make sense to display, `canCreateConfigurable()` returns `true`.
In that case the Consulo calls [`ConfigurableProvider.createConfigurable()`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/ConfigurableProvider.java), which returns the [`Configurable`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/Configurable.java) object for its Settings implementation.

By choosing not to provide a `Configuration` implementation in some circumstances, the [`ConfigurableProvider`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/ConfigurableProvider.java) opts out of the Settings display and modification process.
The use of [`ConfigurableProvider`](https://github.com/consulo/consulo/blob/master/modules/base/configurable-api/src/main/java/consulo/configurable/ConfigurableProvider.java) as a basis for a Settings implementation is registered using `@ExtensionImpl` on the implementation class.
