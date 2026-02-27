---
title: Plugin Extensions
redirect_from:
    /basics/plugin_structure/plugin_extensions_and_extension_points.html
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

_Extensions_ are the most common way for a plugin to extend the Consulo Platform's functionality in a way that is not as straightforward as adding an action to a menu or toolbar.

The following are some of the most common tasks accomplished using extensions:

  * The `consulo.toolWindow` extension point allows plugins to add [tool windows](/user_interface_components/tool_windows.md)
  (panels displayed at the sides of the IDE user interface);
  * The `consulo.applicationConfigurable` and `consulo.projectConfigurable` extension points allow plugins to add pages to the
    [Settings/Preferences dialog](/basics/settings.md);
  * [Custom language plugins](/reference_guide/custom_language_support.md) use many extension points
    to extend various language support features in the IDE.

There are [more than 1000 extension](#how-to-get-the-extension-points-list) points available in the platform and the bundled plugins, allowing to customize different parts of the IDE behavior.

## Declaring Extensions

> **TIP** Auto-completion, Quick Documentation, and other code insight features are available on extension point tags and attributes.

1. Add an `<extensions>` element to your `plugin.xml` if it's not yet present there.
   Set the `defaultExtensionNs` attribute to one of the following values:
    * `consulo`, if your plugin extends the Consulo Platform core functionality.
    * `{ID of a plugin}`, if your plugin extends the functionality of another plugin (must configure [Plugin Dependencies](plugin_dependencies.md)).
2. Add a new child element to the `<extensions>` element.
   The child element name must match the name of the extension point you want the extension to access.
3. Depending on the type of the extension point, do one of the following:
    * If the extension point was declared using the `interface` attribute, for newly added child element, set the `implementation` attribute to the name of the class that implements the specified interface.
    * If the extension point was declared using the `beanClass` attribute, for newly added child element, set all attributes annotated with the `@Attribute` annotations in the specified bean class.


To clarify this procedure, consider the following sample section of the `plugin.xml` file that defines two extensions designed to access the `consulo.appStarter` and `consulo.projectTemplatesFactory` extension points in the *Consulo Platform* and one extension to access the `another.plugin.myExtensionPoint` extension point in another plugin `another.plugin`:

```xml
<!-- Declare extensions to access extension points in the Consulo Platform.
     These extension points have been declared using "interface".
 -->
  <extensions defaultExtensionNs="consulo">
    <appStarter implementation="com.myplugin.MyAppStarter" />
    <projectTemplatesFactory implementation="com.myplugin.MyProjectTemplatesFactory" />
  </extensions>

<!-- Declare extensions to access extension points in a custom plugin "another.plugin"
     The "myExtensionPoint" extension point has been declared using "beanClass"
     and exposes custom properties "key" and "implementationClass".
-->
  <extensions defaultExtensionNs="another.plugin">
     <myExtensionPoint key="keyValue"
                       implementationClass="com.myplugin.MyExtensionPointImpl" />
  </extensions>
```

### Extension Default Properties
The following properties are available always:

- `id` - unique ID
- `order` - allows to order all defined extensions using `first`, `last` or `before|after [id]` respectively
- `os` - allows restricting extension to given OS, e.g., `os="windows"` registers the extension on Windows only
                     
If an extension instance needs to "opt out" in certain scenarios, it can throw `ExtensionNotApplicableException` in its constructor.

### Extension Properties Code Insight
Several tooling features are available to help configure bean class extension points in `plugin.xml`.

Properties annotated with `@RequiredElement` are inserted automatically and validated (2019.3 and later).
If the given property is allowed to have an explicit empty value, set `allowEmpty` to `true` (2020.3 and later).

Property names matching the following list will resolve to FQN:
- `implementation`
- `className`
- `serviceInterface` / `serviceImplementation`
- ending with `Class` (case-sensitive)

A required parent type can be specified in the extension point declaration via nested `<with>`:

```xml
    <extensionPoint name="myExtension" beanClass="MyExtensionBean">
      <with attribute="psiElementClass" implements="consulo.language.psi.PsiElement"/>
    </extensionPoint>
```

Property name `language` (or ending in `*Language`, 2020.2+) resolves to all present `Language` IDs.

Similarly, `action` resolves to all registered `<action>` IDs.

Specifying `@Nls` validates a UI `String` capitalization according to the text property `Capitalization` enum value (2019.2 and later).

Attributes with `Enum` type support code insight with _lowerSnakeCased_ notation (2020.1 and later).

## How to get the extension points list?

[Extension Point List](/appendix/resources/extension_point_list.md) contains all available extension points in the *Consulo Platform* and from bundled plugins.

Alternatively (or when using 3rd party extension points), all available extension points for the specified namespace can be listed using auto-completion inside the `<extensions>` block.
Use **View \| Quick Documentation** in the lookup list to access more information about the extension point and implementation (if applicable).


