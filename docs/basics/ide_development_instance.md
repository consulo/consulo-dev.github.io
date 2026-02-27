---
title: IDE Development Instances
redirect_from:
  - /basics/settings_caches_logs.html
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

A feature for developing plugins is running or debugging a plugin project from within the Consulo IDE.
Selecting the [**runIde**](/tutorials/build_system/prerequisites.md#running-a-simple-gradle-based-consulo-plugin) task for a Gradle-based project (or [**Run**](getting_started/running_and_debugging_a_plugin.md) menu for a DevKit-based project) will launch a _Development Instance_ of the IDE with the plugin enabled.
This page describes how to control some of the settings for the Development Instance.

> **TIP** Please see also the Consulo documentation on Advanced Configuration for general VM options and properties.

## Using a Runtime for the Development Instance
An everyday use case is to develop (build) a plugin project against a JDK, e.g., Java 8, and then run or debug the plugin in a Development Instance of the IDE.
In such a situation, Development Instance must use an appropriate runtime rather than the JDK used to build the plugin project.

The Consulo Runtime is an environment for running Consulo-based IDEs on Windows, macOS, and Linux.
A version of the runtime is bundled with all Consulo-based IDEs.
To produce accurate results while running or debugging a plugin project in a Development Instance, follow the procedures below to ensure the Development Instance uses the appropriate runtime.

### Setting a Runtime for Gradle-Based Plugin Projects
By default, the Gradle plugin will fetch and use the version of the runtime for the Development Instance corresponding to the version of the Consulo used for building the plugin project.

### Setting a Runtime for DevKit-Based Plugin Projects
The Run Configuration for a DevKit-based plugin project controls the JDK used to run and debug a plugin project in a Development Instance.
The default Run Configuration uses the same JDK for building the plugin project and running the plugin in a Development Instance.
To change the runtime for the Development Instance, set the _JRE_ field in the Run Configuration edit dialog.

### Gradle plugin 0.4.22 and Later
Enabled by default for target platform 2020.2 or later.
Set `autoReloadPlugins = true` in [**runIde**](/tutorials/build_system/prerequisites.md#running-a-simple-gradle-based-consulo-plugin) task to enable it for earlier platform versions or `autoReloadPlugins = false` to disable it explicitly.

### Gradle plugin 0.4.21 and Earlier/DevKit
Add system property `idea.auto.reload.plugins` in the [run configuration](getting_started/running_and_debugging_a_plugin.md) (DevKit-based) or [**runIde**](/tutorials/build_system/prerequisites.md#running-a-simple-gradle-based-consulo-plugin) task (Gradle-based).
For [Gradle-based plugins](/tutorials/build_system/prerequisites.md) using `consulo-gradle-plugin` 0.4.17 or later, this property is set automatically.

To disable auto-reload, set `idea.auto.reload.plugins` to `false` explicitly (2020.1.2+).


## The Development Instance Sandbox Directory
The _Sandbox Home_ directory contains the [settings, caches, logs, and plugins](#development-instance-settings-caches-logs-and-plugins) for a Development Instance of the IDE.
This information is stored in a different location than for the installed IDE itself.

### Sandbox Home Location for Gradle-Based Plugin Projects
For Gradle-based plugins, the default Sandbox Home location is defined by the Consulo `consulo-gradle-plugin`.
See [Configuring a Gradle Plugin Project](/tutorials/build_system/prerequisites.md) for more information about specifying a Sandbox Home location.
The default Sandbox Home location for Gradle-based plugin projects is:
* **Windows** `<Project Dir>\build\idea-sandbox`
* **Linux or macOS** `<Project Dir>/build/idea-sandbox`

### Sandbox Home Location for DevKit-Based Plugin Projects
For DevKit-based plugins, the default Sandbox Home location is defined in the Consulo Plugin SDK.
See specifying the [Sandbox Home for DevKit Projects](/basics/getting_started/setting_up_environment.md) for more information.
The default Sandbox Home directory location for DevKit-based plugin projects is:
* **Windows:** `<User home>\.<product_system_name><product_version>\system\plugins-sandbox\`
* **Linux:** `~/.<product_system_name><product_version>/system/plugins-sandbox/`
* **macOS** `~/Library/Caches/<product_system_name><product_version>/plugins-sandbox/`

### Development Instance Settings, Caches, Logs, and Plugins
Within the Sandbox Home directory are subdirectories of the Development Instance:
* `config` contains settings for the IDE instance.
* `plugins` contains folders for each plugin being run in the IDE instance.
* `system/caches` or `system\caches` holds the IDE instance data.
* `system/log` or `system\log` contains the `idea.log` file for the IDE instance.

Each of these Sandbox Home subdirectories can be manually cleared to reset the IDE Development Instance.
At the next launch of a Development Instance, the subdirectories will be repopulated with the appropriate information.
