---
title: Plugin Components
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

> **WARNING** When writing new plugins, creating Components should be avoided.
> Any existing Components should be migrated to services, extensions, or listeners (see below).

Plugin Components are a legacy feature supported for compatibility with plugins created for older versions of the Consulo.

Plugin Components are defined in the `<application-components>`, `<project-components>`, and `<module-components>` sections in a [Plugin Configuration File](plugin_configuration_file.md).

## Migration

To migrate existing code from Components to more modern APIs, please see the following guidelines.

### Manage State

To manage some state or logic that is only needed when the user performs a specific operation, use a [Service](plugin_services.md).

### Persisting State

To store the state of your plugin at the application or project level, use a [Service](plugin_services.md), and implement the [`PersistentStateComponent`](https://github.com/consulo/consulo/blob/master/modules/base/component-api/src/main/java/consulo/component/persist/PersistentStateComponent.java) interface. See [Persisting State of Components](/basics/persisting_state_of_components.md) for details.

### Subscribing to Events

To subscribe to events, use a [listener](plugin_listeners.md) or create an [extension](plugin_extensions.md) for a dedicated extension point (for example, `consulo.editorFactoryListener`) if one exists for the event to subscribe to.

### Application Startup

Executing code on application startup should be avoided whenever possible because it slows down startup.
Plugin code should only be executed when projects are opened (see [Project Open](#project-open)) or when the user invokes an action of a plugin.
If this cannot be avoided, add a [listener](plugin_listeners.md) subscribing to the [`AppLifecycleListener`](https://github.com/consulo/consulo/blob/master/modules/base/application-api/src/main/java/consulo/application/AppLifecycleListener.java) topic.

To execute an activity in background on IDE startup (e.g., to warm up caches), use [`PreloadingActivity`](https://github.com/consulo/consulo/blob/master/modules/base/application-api/src/main/java/consulo/application/PreloadingActivity.java).

### Project Open

To execute code when a project is being opened, use one of these two [extensions](plugin_extensions.md):

`consulo.postStartupActivity`
: [`StartupActivity`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/startup/StartupActivity.java) for immediate execution on EDT. Implement [`DumbAware`](https://github.com/consulo/consulo/blob/master/modules/base/application-api/src/main/java/consulo/application/dumb/DumbAware.java) to indicate activity can run in background thread (in parallel with other such tasks).

`consulo.backgroundPostStartupActivity`
: `StartupActivity.Background` for execution with 5 seconds delay in background thread (2019.3 or later).

Any long-running or CPU intensive tasks should be made visible to users by using [`ProgressManager.run(Task.Backgroundable)`](https://github.com/consulo/consulo/blob/master/modules/base/application-api/src/main/java/consulo/application/progress/ProgressManager.java).
Access to indices must be wrapped with `DumbService`, see also [General Threading Rules](/basics/architectural_overview/general_threading_rules.md).  

### Application/Project Close

To execute code on project closing or application shutdown, implement the [`Disposable`](https://github.com/consulo/consulo/blob/master/modules/base/disposer-api/src/main/java/consulo/disposer/Disposable.java) interface in a [Service](plugin_services.md) and place the code in the `dispose()` method. Alternatively, use [`Disposer.register()`](https://github.com/consulo/consulo/blob/master/modules/base/disposer-api/src/main/java/consulo/disposer/Disposer.java) passing a [`Project`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/Project.java) or `Application` service instance as the `parent` argument (see [Choosing a Disposable Parent](/basics/disposers.md#choosing-a-disposable-parent)).
