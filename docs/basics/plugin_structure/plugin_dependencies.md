---
title: Plugin Dependencies
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

A plugin may depend on classes from other plugins, either bundled, third-party, or by the same author.
This document describes the syntax for declaring plugin dependencies and optional plugin dependencies.
For more information about dependencies on the Consulo modules, see Part II of this document: [Plugin Compatibility with Consulo Products](/basics/getting_started/plugin_compatibility.md).

> **NOTE** It is impossible to specify the minimum/maximum version for the dependent plugin.

To express dependencies on classes from other plugins or modules, perform the following three required steps:

## 1. Locating Plugin ID and Preparing Sandbox
A compatible version must be chosen carefully according to the plugin's [compatibility](/basics/getting_started/build_number_ranges.md). 

For plugins published on [Consulo Plugin Repository](https://plugins.consulo.app)
- open plugin's detail page
- locate the _Plugin ID_

For bundled and non-public plugins, locate the plugin's main JAR file containing `META-INF/plugin.xml` descriptor with `<id>` tag (or `<name>` if not specified).

If the plugin is not bundled with the target IDE, run the (sandbox) [IDE Development Instance](/basics/ide_development_instance.md) of your target IDE and install the plugin there.

## 2. Project Setup
Consulo plugins use Maven with `maven-consulo-plugin` for building. Add the dependency plugin as a Maven dependency in your `pom.xml`.

> **WARNING** Do not add the plugin JARs as a library directly: this will fail at runtime because Consulo will load two separate copies of the dependency plugin classes.

## 3. Dependency Declaration in plugin.xml
If a project depends on another plugin, the dependency must be declared in `plugin.xml`.

### 3.1 Configuring plugin.xml
In the `plugin.xml`, add a `<depends>` tag with the dependency plugin's ID as its content.
Continuing with the example from [Section 2](#2-project-setup) above, the dependency declaration in `plugin.xml` would be:

```xml
<depends>org.another.plugin</depends>
```


## Optional Plugin Dependencies
A project can also specify an optional plugin dependency.
In this case, the plugin will load even if the plugin it depends on is not installed or enabled, but part of the plugin's functionality will not be available.

Declare additional `optional="true"` attribute:

```xml
  <depends optional="true">dependency.plugin.id</depends>
```

For example, if a plugin adds additional highlighting for Java and Kotlin files, use the following setup.
The main `plugin.xml` declares an optional dependency on the Kotlin plugin (`consulo.kotlin`):

_plugin.xml_

```xml
<consulo-plugin>
   ...
   <depends optional="true">consulo.kotlin</depends>
</consulo-plugin>
```

The annotators themselves are registered using the `@ExtensionImpl` annotation on the implementation classes. Place optional-dependency annotators in a separate module that depends on the optional plugin. The platform will discover them automatically via annotation scanning; no separate XML config files are needed.

```java
@ExtensionImpl
public class MyJavaAnnotator implements Annotator {
    // Java-specific highlighting
}
```

```java
@ExtensionImpl
public class MyKotlinAnnotator implements Annotator {
    // Kotlin-specific highlighting, in a module that depends on consulo.kotlin
}
```
