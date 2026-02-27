---
title: Working with Icons and Images
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Icons and images are used widely by Consulo plugins.
Plugins need icons mostly for actions, custom components renderers, tool windows, and so on.

::: info
Plugin Icons, which represent a plugin itself, have different requirements than icons and images used within a plugin.
:::

For more information see the [Plugin Icon](/basics/plugin_structure/plugin_icon_file.md) page.

::: tip
Plugins should reuse existing platform icons whenever possible, see `PlatformIconGroup` (e.g., `PlatformIconGroup.actionsClose()`).
:::


## Icon Library (ICON-LIB) System

Consulo uses the **Icon Library** system for managing icons. Icons are placed in a special `ICON-LIB` directory inside your plugin's resources, and a Maven plugin auto-generates a typed Java class with static accessor methods for each icon.

### Directory Structure

Icons must be placed under `src/main/resources/ICON-LIB/` with `light/` and `dark/` subdirectories. Each subdirectory contains an **Icon Group** directory whose name is a fully qualified class-like identifier ending with `IconGroup`.

```
src/main/resources/ICON-LIB/
├── light/
│   └── com.example.plugin.MyPluginIconGroup/
│       ├── actions/
│       │   └── myAction.svg
│       ├── fileTypes/
│       │   └── myFileType.svg
│       └── toolWindow/
│           └── myToolWindow.svg
└── dark/
    └── com.example.plugin.MyPluginIconGroup/
        ├── actions/
        │   └── myAction.svg
        ├── fileTypes/
        │   └── myFileType.svg
        └── toolWindow/
            └── myToolWindow.svg
```

Key rules:

* The top-level directory **must** be named `ICON-LIB` (all caps).
* `light` and `dark` are the built-in library IDs managed by `IconLibraryManager`.
* The Icon Group directory name **must** end with `IconGroup` and follow a fully qualified naming convention (e.g., `consulo.platform.base.PlatformIconGroup`).
* Dark theme icons are optional -- if a dark variant is not provided, the light icon is used automatically.
* Category subdirectories (e.g., `actions/`, `fileTypes/`, `toolWindow/`) organize icons by usage and become method name prefixes in the generated class.

### Maven Plugin Configuration

The `maven-consulo-plugin` generates the Icon Group Java class during the `generate-sources` phase. Add the following to your `pom.xml`:

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
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

The generated source files are written to `target/generated-sources/icon/`.

### Auto-Generated Icon Group Class

For the directory structure shown above, the Maven plugin generates a class like:

```java
package com.example.plugin;

import consulo.ui.image.ImageKey;

public final class MyPluginIconGroup {
    public static final String ID = "com.example.plugin.MyPluginIconGroup";

    private static final ImageKey actions_myaction = ImageKey.of(ID, "actions.myaction", 16, 16);
    private static final ImageKey filetypes_myfiletype = ImageKey.of(ID, "filetypes.myfiletype", 16, 16);
    private static final ImageKey toolwindow_mytoolwindow = ImageKey.of(ID, "toolwindow.mytoolwindow", 13, 13);

    public static ImageKey actionsMyaction() {
        return actions_myaction;
    }

    public static ImageKey filetypesMyfiletype() {
        return filetypes_myfiletype;
    }

    public static ImageKey toolwindowMytoolwindow() {
        return toolwindow_mytoolwindow;
    }
}
```

The naming convention works as follows:

* Category directories become method name prefixes (e.g., `actions/myAction.svg` produces `actionsMyaction()`).
* The SVG `width` and `height` attributes determine the `ImageKey` dimensions.
* `ImageKey` implements `Image`, so it can be used anywhere an `Image` is expected.
* `ImageKey.of(groupId, imageId, width, height)` is the factory method used internally.

### Using Icons in Code

Reference the generated static methods from your Icon Group class:

**In actions:**

```java
@ActionImpl(id = "MyPlugin.MyAction", parents = @ActionParentRef(@ActionRef(id = "ToolsMenu")))
public class MyAction extends AnAction {
    public MyAction() {
        super("My Action", "Description", MyPluginIconGroup.actionsMyaction());
    }

    @Override
    public void actionPerformed(@Nonnull AnActionEvent e) {
        // action logic
    }
}
```

**In file types:**

```java
@Override
public Image getIcon() {
    return MyPluginIconGroup.filetypesMyfiletype();
}
```

**In tool windows:**

```java
@Override
public Image getIcon() {
    return MyPluginIconGroup.toolwindowMytoolwindow();
}
```

### Reusing Platform Icons

For standard icons provided by the platform, use `PlatformIconGroup` instead of defining your own:

```java
Image closeIcon = PlatformIconGroup.actionsClose();
Image settingsIcon = PlatformIconGroup.generalSettings();
```

## Image Formats

### SVG Format (Recommended)

SVG is the recommended format for icons. SVG icons scale cleanly on HiDPI displays and across different resolutions.

The base size of the icon is set via the `width` and `height` attributes in the SVG file (without size units). If unspecified, it defaults to 16x16 pixels.

A minimal SVG icon file:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
 <rect width="100%" height="100%" fill="green"/>
</svg>
```

An `@2x` variant of an SVG icon should keep the same base size but express the icon graphics in more detail via double precision. If the icon graphics are simple enough to render well at every scale, the `@2x` version can be omitted.

### PNG Format

PNG icons are also supported. For HiDPI displays, provide `@2x` variants:

* **iconName.png** -- base resolution
* **iconName@2x.png** -- 2x resolution for HiDPI displays

### Icon Sizes

Required icon sizes depend on the usage:

| Usage                  | Icon Size (pixels) |
| ---------------------- | ------------------ |
| Node, Action, Filetype | 16x16              |
| Tool window            | 13x13              |
| Editor gutter          | 12x12              |

## Icon Library Manager

The `IconLibraryManager` manages the active icon library and resolves images at runtime:

* **Built-in libraries**: `light` and `dark` correspond to the `light/` and `dark/` directories under `ICON-LIB/`.
* The active library is selected automatically based on the current theme.
* If a dark variant is not provided for an icon, the system falls back to the light variant.
