---
title: Image Library
---

## Directory Structure

Icons are placed under the `ICON-LIB` directory in your module's resources:

```
src/main/resources/ICON-LIB/
├── light/
│   └── {fully.qualified.IconGroupName}/
│       └── {category}/
│           └── iconName.svg
└── dark/
    └── {fully.qualified.IconGroupName}/
        └── {category}/
            └── iconName.svg
```

**Example:**

```
src/main/resources/ICON-LIB/
├── light/
│   └── consulo.plugin.PluginIconGroup/
│       ├── actions/
│       │   └── close.svg
│       └── nodes/
│           └── module.svg
└── dark/
    └── consulo.plugin.PluginIconGroup/
        ├── actions/
        │   └── close.svg
        └── nodes/
            └── module.svg
```

## Directory Rules

* **`ICON-LIB`** -- the top-level directory name must be exactly `ICON-LIB` (all caps).
* **`light` / `dark`** -- these are the built-in Image Library IDs. `light` icons are used with the light theme, `dark` icons with the dark theme. If a dark variant is not provided, the light icon is used as a fallback.
* **Icon Group directory** -- the directory immediately under `light/` or `dark/` is the Icon Group name. It must be a fully qualified class-like name ending with `IconGroup` (e.g., `consulo.plugin.PluginIconGroup`).
* **Category directories** -- subdirectories within the Icon Group (e.g., `actions/`, `nodes/`, `fileTypes/`) organize icons by usage. Category names become method name prefixes in the generated class.

## Maven Plugin Configuration

The `maven-consulo-plugin` generates a typed Java Icon Group class from the `ICON-LIB` directory structure. Add the following to your `pom.xml`:

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

The generated class is written to `target/generated-sources/icon/`.

## Generated Icon Group Class

For the example structure above, the plugin generates:

```java
package consulo.plugin;

import consulo.ui.image.ImageKey;

public final class PluginIconGroup {
    public static final String ID = "consulo.plugin.PluginIconGroup";

    private static final ImageKey actions_close = ImageKey.of(ID, "actions.close", 16, 16);
    private static final ImageKey nodes_module = ImageKey.of(ID, "nodes.module", 16, 16);

    public static ImageKey actionsClose() {
        return actions_close;
    }

    public static ImageKey nodesModule() {
        return nodes_module;
    }
}
```

## Naming Convention

* Category directories become method name prefixes: `actions/close.svg` generates `actionsClose()`.
* The SVG `width` and `height` attributes determine the `ImageKey` dimensions.
* `ImageKey` implements `Image` and is created via `ImageKey.of(groupId, imageId, width, height)`.

## Icon Format

* **SVG** is the recommended format. The `width` and `height` attributes in the SVG file set the base icon size.
* **PNG** is also supported. Provide `@2x` variants for HiDPI displays.
