---
title: Tree Structure View
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

This tutorial is meant to illustrate how the project tree structure view appearance can be modified programmatically.
If you need to know more about basic concepts of a project view in Consulo-based IDEs, please refer to the Exploring The Project Structure section of the Consulo documentation.

Series of step below show how to filter out and keep visible only text files and directories in the Project View Panel.

## Pre-Requirements

Create an empty plugin project.
See [Creating a Plugin Project](/tutorials/build_system/prerequisites.md).

## 1. Implement Custom TreeStructureProvider

To provide custom Structure View behaviour you need to implement the `TreeStructureProvider` interface.
In Consulo, `TreeStructureProvider` is annotated with `@ExtensionAPI`, so implementations are registered using the `@ExtensionImpl` annotation instead of XML.

```java
@ExtensionImpl
public class TextOnlyTreeStructureProvider implements TreeStructureProvider {
    @NotNull
    @Override
    public Collection<AbstractTreeNode> modify(@NotNull AbstractTreeNode parent, @NotNull Collection<AbstractTreeNode> children, ViewSettings settings) {
        return null;
    }

    @Nullable
    @Override
    public Object getData(Collection<AbstractTreeNode> collection, String s) {
        return null;
    }
}
```

## 2. Override modify() Method

To implement Tree Structure nodes filtering logic, override `modify()` method.
The example below shows how to filter out all the Project View nodes except those which correspond to text files and directories.

```java
{% include /code_samples/tree_structure_provider/src/main/java/org/intellij/sdk/treeStructureProvider/TextOnlyTreeStructureProvider.java %}
```

## 3. Compile and Run the Plugin

Compile and run the code sample from this tutorial.
Refer to [Running and Debugging a Plugin](/basics/getting_started/running_and_debugging_a_plugin.md).

After going through the steps described above you can see only text files and directories belonging to a project in the Project View.

![Text Files](tree_structure_view/img/text_only.png)


Build the project to see how TreeStructureView provider works in practice.
