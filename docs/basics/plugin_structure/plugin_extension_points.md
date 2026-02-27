---
title: Plugin Extension Points
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

::: info
See [Plugin Extensions](plugin_extensions.md) for _using_ extension points in your plugin.
:::


By defining _extension points_ in your plugin, you can allow other plugins to extend your plugin's functionality.
An extension point is declared by annotating an interface or abstract class with `@ExtensionAPI`.
Other plugins then provide implementations of that interface, annotated with `@ExtensionImpl`, which the platform discovers automatically at runtime.

## Declaring Extension Points

Extension points are defined by annotating an interface or abstract class with `@ExtensionAPI(ComponentScope.xxx)`.

The `ComponentScope` determines the extension's lifecycle:

- `ComponentScope.APPLICATION` - the extension is a global singleton, instantiated once for the entire application.
- `ComponentScope.PROJECT` - the extension is instantiated once per open project.
- `ComponentScope.MODULE` - the extension is instantiated once per module.

_myPlugin/src/com/myplugin/MyExtensionPoint.java_

```java
@ExtensionAPI(ComponentScope.APPLICATION)
public interface MyExtensionPoint {
    String getKey();
    void process();
}
```

No XML declaration is needed. The `@ExtensionAPI` annotation is sufficient to register the extension point with the platform.

### Sample

A plugin that wants to implement the above extension point simply creates a class implementing the interface and annotates it with `@ExtensionImpl`:

_anotherPlugin/src/another/MyExtensionImpl.java_

```java
@ExtensionImpl
public class MyExtensionImpl implements MyExtensionPoint {
    @Override
    public String getKey() { return "myKey"; }

    @Override
    public void process() { /* implementation */ }
}
```

The platform discovers the `@ExtensionImpl`-annotated class automatically. No XML configuration or plugin dependency declarations beyond the standard module dependency are required.

## Using Extension Points

To access all registered extension instances at runtime, use `Application.get().getExtensionPoint()` or `ExtensionPointName.create()`:

_myPlugin/src/com/myplugin/MyExtensionUsingService.java_

```java
public class MyExtensionUsingService {

    public void useExtensions() {
      // Option 1: via Application
      List<MyExtensionPoint> extensions =
        Application.get().getExtensionPoint(MyExtensionPoint.class).getExtensionList();

      // Option 2: via ExtensionPointName
      ExtensionPointName<MyExtensionPoint> EP_NAME =
        ExtensionPointName.create(MyExtensionPoint.class);
      List<MyExtensionPoint> extensionList = EP_NAME.getExtensionList();

      for (MyExtensionPoint extension : extensionList) {
        String key = extension.getKey();
        extension.process();
        // ...
      }
    }
}
```
