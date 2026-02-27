---
title: Configuring Maven Projects
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

This page serves as a guide to the Maven-based plugin configuration for _Consulo_ projects.

The [Getting Started with Maven](prerequisites.md) page provides a tutorial for creating Maven-based Consulo plugins.
It may be useful to review the Consulo page, particularly the description of versioning in the [Open Source](/intro/intellij_platform.md#open-source) section.

> **WARNING** When adding additional repositories to your Maven build script, always use HTTPS protocol.

* bullet list
{:toc}

## Overview of the Maven Plugin
The `maven-consulo-plugin` provides Maven goals that enable developing Consulo plugins.

When getting started, there are several items to note:
* It is advised to upgrade to the latest available version of the `maven-consulo-plugin` regularly.
* The plugin provides goals for code generation (icons and localization), packaging, and deployment.

## Guide to Configuring Maven Plugin Functionality
This section presents a guided tour of `maven-consulo-plugin` configuration to achieve commonly desired functionality.

### Configuring the Maven Plugin for Building Consulo Plugin Projects
The `maven-consulo-plugin` builds plugin projects against the Consulo API.

> **NOTE** Using EAP versions of the Consulo requires adding the _Snapshots repository_ to the `pom.xml` file (see [Consulo Artifacts Repositories](/reference_guide/intellij_artifacts.md)).

#### Consulo Configuration
The Consulo API version your plugin targets is controlled by the dependency versions declared in your `pom.xml`.

All available platform versions can be browsed in the [Consulo Artifacts Repositories](/reference_guide/intellij_artifacts.md).

#### Plugin Dependencies
Consulo plugin projects may depend on either bundled or third-party plugins.
In that case, a project should declare Maven dependencies on those plugins that match the Consulo version used to build the plugin project.

Note that this describes a build-time dependency so that Maven can resolve the required artifacts.
The runtime dependency must be added in the [Plugin Configuration](/basics/plugin_structure/plugin_configuration_file.md) (`plugin.xml`) file as described in [Plugin Dependencies](/basics/plugin_structure/plugin_dependencies.md#3-dependency-declaration-in-pluginxml).

### Code Generation Goals
The `maven-consulo-plugin` provides goals for generating source code:
* `generate-icon` - Generates icon classes from icon definitions in `ICON-LIB/`.
* `generate-localize` - Generates localization classes from localize files in `LOCALIZE-LIB/`.

These goals are typically configured to run during the `generate-sources` phase:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>consulo.maven</groupId>
            <artifactId>maven-consulo-plugin</artifactId>
            <extensions>true</extensions>
            <executions>
                <execution>
                    <phase>generate-sources</phase>
                    <goals>
                        <goal>generate-icon</goal>
                        <goal>generate-localize</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

### Configuring the Plugin Configuration File
The `since-build` and `until-build` values are specified directly in your `plugin.xml` file within the `<idea-version>` element:

```xml
<idea-version since-build="162" until-build="162.*"/>
```

A best practice is to keep version declarations in sync with the Consulo API version your plugin targets.

### Verifying Plugin
Before publishing, verify your plugin works correctly by building it and installing it into a local Consulo instance.

### Publishing with Maven
Please review the [Publishing Plugins with Maven](deployment.md) page for information about deploying your plugin to the [Consulo Plugin Repository](https://plugins.consulo.app).

## Common Maven Plugin Configurations for Development
Different combinations of Maven plugin configuration are needed to create the desired build environment.
This section reviews some of the more common configurations.

### Plugins Targeting Consulo
Consulo plugins have the most straightforward Maven plugin configuration.
* Determine the version of Consulo API to use for building the plugin project.
  This can be determined from the [build number ranges](/basics/getting_started/build_number_ranges.md).
  * Set the necessary [plugin dependencies](#plugin-dependencies), if any.
* Set the appropriate `since-build` and `until-build` values in your `plugin.xml` file.

### Plugins Targeting Alternate Consulo-Based IDEs
Maven also supports developing plugins to run in IDEs that are based on the Consulo.
For more information, see the [Developing for Multiple Products](/products/dev_alternate_products.md) page of this guide.
