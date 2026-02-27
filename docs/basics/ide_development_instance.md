---
title: IDE Development Instances
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

A feature for developing plugins is running or debugging a plugin project from within the Consulo IDE.
Selecting the appropriate run configuration for a Maven-based project (or [**Run**](getting_started/running_and_debugging_a_plugin.md) menu for a DevKit-based project) will launch a _Development Instance_ of the IDE with the plugin enabled.
This page describes how to control some of the settings for the Development Instance.

::: tip
Please see also the Consulo documentation on Advanced Configuration for general VM options and properties.
:::


## Runtime

Consulo requires **JDK 21**. The runtime is bundled with all Consulo-based IDEs. Overriding the runtime is not supported.

## The Development Instance Sandbox Directory
The _Sandbox Home_ directory contains the [settings, caches, logs, and plugins](#development-instance-settings-caches-logs-and-plugins) for a Development Instance of the IDE.
This information is stored in a different location than for the installed IDE itself.

### Sandbox Home Location for Maven-Based Plugin Projects
For Maven-based plugins, the default Sandbox Home location is defined by the Consulo build tools.
See [Configuring a Maven Plugin Project](/tutorials/build_system/prerequisites.md) for more information about specifying a Sandbox Home location.
The default Sandbox Home location for Maven-based plugin projects is:
* **Windows** `<Project Dir>\target\consulo-sandbox`
* **Linux or macOS** `<Project Dir>/target/consulo-sandbox`

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
