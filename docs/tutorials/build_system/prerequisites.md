---
title: Getting Started with Maven
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Maven is the preferred solution for creating Consulo plugins.
The `maven-consulo-plugin` handles dependencies, code generation, and packaging.

> **WARNING** When adding additional repositories to your Maven build script, always use HTTPS protocol.

* bullet list
{:toc}

## Creating a Maven-Based Consulo Plugin

The recommended way to start a new Consulo plugin project is to use the [Consulo Simple Plugin Template](https://github.com/consulo/consulo-simple-plugin-template) as a starting point.

Alternatively, you can create a new Maven project manually with the following structure:

### Standard Maven Project Structure

```text
my_plugin/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/
    │   └── resources/
    │       ├── META-INF/
    │       │   └── plugin.xml
    │       ├── ICON-LIB/
    │       └── LOCALIZE-LIB/
    └── test/
        └── java/
```

* The `pom.xml` file contains the Maven project configuration including the `maven-consulo-plugin` setup.
* The `META-INF` directory under the default `main` source directory contains the plugin [configuration file](/basics/plugin_structure/plugin_configuration_file.md).
* The `ICON-LIB` directory contains icon definitions that are processed by the `generate-icon` goal.
* The `LOCALIZE-LIB` directory contains localization files that are processed by the `generate-localize` goal.

### Example pom.xml

The following `pom.xml` shows a typical Consulo plugin project configuration:

```xml
<project>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.your.company</groupId>
    <artifactId>my_plugin</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>consulo-plugin</packaging>

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

    <repositories>
        <repository>
            <id>consulo-snapshots</id>
            <url>https://maven.consulo.app/repository/snapshots/</url>
        </repository>
    </repositories>

    <dependencies>
        <!-- Consulo API dependencies -->
    </dependencies>
</project>
```

#### Plugin Maven Properties and Plugin Configuration File Elements
The Maven properties `project.groupId` and `project.artifactId` will not, in general, match the respective [plugin configuration file](/basics/plugin_structure/plugin_configuration_file.md) `plugin.xml` elements `<name>` and `<id>`.
There is no Consulo-related reason they should as they serve different functions.

The `<name>` element (used as the plugin's display name) is often the same as the `artifactId`, but it can be more explanatory.

The `<id>` value must be a unique identifier over all plugins, typically a concatenation of the specified _groupId_ and _artifactId_.
Please note that it is impossible to change the `<id>` of a published plugin without losing automatic updates for existing installations.

## Adding Maven Support to an Existing DevKit-Based Consulo Plugin
Converting a [DevKit-based](/basics/getting_started/using_dev_kit.md) plugin project to a Maven-based plugin project:
* Ensure the directory containing the DevKit-based Consulo plugin project can be fully recovered if necessary.
* Delete all the artifacts of the DevKit-based project:
  * `.idea` directory
  * `[modulename].iml` file
  * `out` directory
* Arrange the existing source files within the project directory in the standard Maven [source directory layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html).
* Create a `pom.xml` file as shown in the [example above](#example-pomxml).
* Set the values to:
  * _groupId_ to the existing package in the initial source set.
  * _artifactId_ to the name of the existing plugin.
  * _version_ to the same as the existing plugin.
* Import the Maven project in Consulo.

## Running a Simple Maven-Based Consulo Plugin

### Adding Code to the Project
Before running your plugin, some code can be added to provide simple functionality.
See the [Creating Actions](/tutorials/action_system/working_with_custom_actions.md) tutorial for step-by-step instructions for adding a menu action.

### Executing the Plugin
Use the Maven `package` goal to build your plugin:

```
mvn package
```

The resulting plugin artifact will be located in the `target/` directory and can be installed into Consulo for testing.
