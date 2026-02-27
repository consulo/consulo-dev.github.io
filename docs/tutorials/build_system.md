---
title: Building Plugins with Gradle
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The Gradle plugin is the recommended solution for building Consulo plugins.
The plugin takes care of the dependencies of your plugin project - both the base IDE and other plugin dependencies.

The Gradle plugin provides tasks to run the IDE with your plugin and to publish your plugin to the [Consulo Plugin Repository](https://plugins.consulo.app).
To make sure that your plugin is not affected by [API changes](/reference_guide/api_changes_list.md), which may happen between major releases of the platform, you can quickly build your plugin against many versions of the base IDE.

> **WARNING** When adding additional repositories to your Gradle build script, always use HTTPS protocol.

Below are a series of guides to developing and deploying Gradle-based Consulo Plugins:

* [Getting Started with Gradle](build_system/prerequisites.md)
* [Configuring Gradle Projects](build_system/gradle_guide.md)
* [Publishing Plugins with Gradle](build_system/deployment.md)
