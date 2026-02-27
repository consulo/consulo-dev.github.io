---
title: Building Plugins with Maven
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Consulo plugins are built using Maven with the `maven-consulo-plugin`.
The plugin handles dependencies, code generation, and packaging.

The standard `pom.xml` configuration for a Consulo plugin:

```xml
<project>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-consulo-plugin</artifactId>
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

    <dependencies>
        <!-- Consulo API dependencies -->
    </dependencies>
</project>
```

For a working example, see the [Consulo Simple Plugin Template](https://github.com/consulo/consulo-simple-plugin-template).

Below are a series of guides to developing and deploying Maven-based Consulo Plugins:

* [Getting Started with Maven](build_system/prerequisites.md)
* [Configuring Maven Projects](build_system/maven_guide.md)
* [Publishing Plugins with Maven](build_system/deployment.md)
