---
title: Plugin Extensions
redirect_from:
    /basics/plugin_structure/plugin_extensions_and_extension_points.html
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

_Extensions_ are the most common way for a plugin to extend the Consulo Platform's functionality in a way that is not as straightforward as adding an action to a menu or toolbar.

Extensions are implemented by annotating classes with `@ExtensionImpl` that extend or implement interfaces annotated with `@ExtensionAPI`. The following are some of the most common tasks accomplished using extensions:

  * Tool window extensions allow plugins to add [tool windows](/user_interface_components/tool_windows.md)
  (panels displayed at the sides of the IDE user interface);
  * Configurable extensions allow plugins to add pages to the
    [Settings/Preferences dialog](/basics/settings.md);
  * [Custom language plugins](/reference_guide/custom_language_support.md) use many extension points
    to extend various language support features in the IDE.

There are [more than 1000 extension](#how-to-get-the-extension-points-list) points available in the platform and the bundled plugins, allowing to customize different parts of the IDE behavior.

## Declaring Extensions

To declare an extension in your plugin:

1. Find the base interface or abstract class annotated with `@ExtensionAPI(ComponentScope.xxx)` that represents the extension point you want to implement.
2. Create a class that extends or implements it.
3. Annotate your class with `@ExtensionImpl`.

For example, if you want to provide a parser for a custom language, the platform defines the extension point as follows:

```java
// The platform defines the extension point:
@ExtensionAPI(ComponentScope.APPLICATION)
public interface ParserDefinition extends LanguageExtension { ... }

// Your plugin implements it:
@ExtensionImpl
public class MyParserDefinition implements ParserDefinition { ... }
```

No XML registration is needed. The platform discovers `@ExtensionImpl`-annotated classes automatically at runtime.

### Extension Default Properties
The following properties are available via the `@ExtensionImpl` annotation:

- `id` - set a unique ID via `@ExtensionImpl(id = "myId")`
- `order` - control ordering of extensions using `@ExtensionImpl(order = "first")`, `@ExtensionImpl(order = "last")`, or `@ExtensionImpl(order = "before|after [id]")`
- `profiles` - conditionally load the extension via `@ExtensionImpl(profiles = ComponentProfiles.PRODUCTION)`. This allows restricting the extension to specific runtime profiles (e.g., production, testing).

If an extension instance needs to "opt out" in certain scenarios, it can throw `ExtensionNotApplicableException` in its constructor.

## How to get the extension points list?

[Extension Point List](/appendix/resources/extension_point_list.md) contains all available extension points in the *Consulo Platform* and from bundled plugins.

To find available extension points, browse the platform and plugin source code for interfaces and abstract classes annotated with `@ExtensionAPI`. Use **Navigate | Symbol** or your IDE's search functionality to locate them.
