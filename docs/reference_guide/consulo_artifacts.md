---
title: Consulo Artifacts Repositories
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

::: warning
When using additional repositories, make sure to use HTTPS always.
:::


Consulo maintains public repositories that host artifacts related to the Consulo Platform, such as binaries and source code.
These repositories make artifacts more accessible for plugin developers.

The Consulo artifacts repositories are available for snapshot versions. See [Platform Versioning](/basics/getting_started/build_number_ranges.md) for details about the versioning scheme.

See the [Maven coordinates](#specify-the-maven-coordinates-for-the-artifact) section for details about specifying these artifacts.

The repositories have two types of content:
* Binary and source code artifacts for cross-platform, ZIP distributions of Consulo-based IDEs.
  These artifacts are _not intended_ to be accessed directly from a plugin project's build file.
  The build system will access them as-needed for a plugin project.
* Artifacts for individual modules from the Consulo.
These may be downloaded, or accessed directly from a `pom.xml` file, as explained below.

Artifacts for Consulo third-party dependencies are hosted in a separate repository.
A link to this repository should be added to `pom.xml` files when individual modules from a Consulo artifacts repository are used.

## Using Consulo Module Artifacts
Consulo module artifacts are utilized by adding information to a project's `pom.xml` file.
More information about Maven support is available in the Consulo documentation.

To setup dependencies on a module there are two types of information needed:
1. Specify the corresponding repository URL for the artifact.
2. Specify the [Maven coordinates](https://maven.apache.org/pom.html#Maven_Coordinates) for the artifact.

### Specify the Repository URL
The URL for the desired artifact needs to be added to your Maven `pom.xml`:
* Use the Consulo snapshots repository.
* For dependencies on individual modules from the Consulo, also use the Consulo third-party dependencies repository.

### Specify the Maven Coordinates for the Artifact
Describing a desired Consulo module artifact is done with Maven coordinates: _groupId_, _artifactId_, and _version_.
The Maven coordinates are based on the names of modules.

The _groupId_ for a module is the prefix `consulo.` concatenated with the first two parts of the module name.
For example, the module `consulo.xml` would have the groupId `consulo.xml`.

The _artifactId_ is the second.._n_ parts of the module name separated by "-" characters.
For example, the module `consulo.xml` would have the artifactId `xml`.
There are some special cases to artifactId names.
If the second part of the module name is a common group like `platform`, `vcs`, or `cloud`, the second part of the module name is dropped, and the artifactId becomes the third.._n_ parts of the module name, separated by "-" characters.
Portions of the module name expressed in `camelCase` format are divided and used in the artifactId as (all lower case) `camel-case`.

The table below shows some example module names and their corresponding groupId and artifactId.

| Module Name                     | groupId                         | artifactId              |
| ------------------------------- | ------------------------------- | ----------------------- |
| consulo.java.compiler.antTasks  | consulo.java                    | java-compiler-ant-tasks |
| consulo.java.debugger           | consulo.java                    | java-debugger           |
| consulo.platform.util           | consulo.platform                | util                    |
| consulo.platform.vcs.log        | consulo.platform                | vcs-log                 |
| consulo.xml.impl                | consulo.xml                     | xml-impl                |

The artifact _version_ is always `3-SNAPSHOT`. Consulo does not publish release artifacts or maintain older versions — all Maven dependencies use this single shared snapshot version.

### Example Artifact Specification
For example, to specify the `jps-model-serialization` module:
  * _groupId_ = `consulo.platform`
  * _artifactId_ = `jps-model-serialization`
  * _classifier_ = `""`
  * _packaging_ = `jar`

## Maven Example for an Individual Module from the Consulo
This section presents an example of using Maven to incorporate a Consulo module and repository in a `pom.xml` file.
The example illustrates declaring the artifact URL, Maven coordinates, and version for the `jps-model-serialization` module artifact.
There are two parts to the example: the repository and the dependency sections.

### Repositories Section
This code snippet selects the snapshots repository for Consulo dependencies.

```xml
<repositories>
    <repository>
        <id>consulo-snapshots</id>
        <url>https://maven.consulo.app/repository/snapshots/</url>
    </repository>
</repositories>
```

### Dependencies Section
This code snippet specifies the desired module artifacts.

```xml
<dependencies>
    <dependency>
        <groupId>consulo.platform</groupId>
        <artifactId>jps-model-serialization</artifactId>
        <version>3-SNAPSHOT</version>
    </dependency>
    <dependency>
        <groupId>consulo.platform</groupId>
        <artifactId>jps-model-impl</artifactId>
        <version>3-SNAPSHOT</version>
    </dependency>
</dependencies>
```

Note:
 * The artifact version (`3-SNAPSHOT`) must match in both statements.
 * In this example `jps-model-serialization` declares the APIs and `jps-model-impl` provides the implementation, so both are required dependencies.
