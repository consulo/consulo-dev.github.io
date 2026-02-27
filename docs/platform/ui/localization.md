---
title: Localization
---

# Localization (LOCALIZE-LIB)

## Overview

Consulo uses a YAML-based localization system called **LOCALIZE-LIB**. Unlike traditional Java resource bundles (`.properties` files), localization entries are defined in YAML files placed under a `LOCALIZE-LIB/` resource directory. During the build, a Maven plugin reads these YAML files and auto-generates Java accessor classes, providing type-safe, static methods for every localized string.

## Directory Structure

Localization files live under `src/main/resources/LOCALIZE-LIB/` in your plugin or module:

```
src/main/resources/
└── LOCALIZE-LIB/
    └── en_US/
        └── com.example.plugin.MyPluginLocalize.yaml
```

| Element | Description |
|---|---|
| `LOCALIZE-LIB` | Top-level directory name. Must be exactly this name, all uppercase. |
| `en_US` | Locale subdirectory. `en_US` is the **default and fallback** locale. |
| `com.example.plugin.MyPluginLocalize.yaml` | YAML file whose name is the **fully qualified class name** of the generated Localize class. |

The YAML filename determines the generated class. For example, `com.example.plugin.MyPluginLocalize.yaml` generates a class `MyPluginLocalize` in the package `com.example.plugin.localize`.

## YAML File Format

Each YAML file contains a flat set of keys. Every key maps to an object with a `text` property holding the localized string:

```yaml
my.action.text:
    text: My _Action
my.action.description:
    text: Performs an action
greeting.message:
    text: Hello, {0}! You have {1} items.
```

### Format Rules

- **Keys** use dot-notation in lowercase (e.g., `my.action.text`).
- Each key has a `text` property containing the localized string value.
- **MessageFormat placeholders** such as `{0}`, `{1}`, etc. are supported. The number of distinct placeholders determines the argument count of the generated method.
- An **underscore** (`_`) before a letter in the text denotes a **mnemonic key**. For example, `_Action` means the mnemonic is **A** (triggered with Alt+A on most platforms).

## Maven Plugin Configuration

The `maven-consulo-plugin` generates Java source files from the YAML localization definitions. Add the following to your `pom.xml`:

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
                        <goal>generate-localize</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

The plugin runs during the `generate-sources` phase and writes generated classes into `target/generated-sources/localize/`.

## Generated Localize Class

Given the YAML file `com.example.plugin.MyPluginLocalize.yaml` shown above, the plugin generates a class similar to:

```java
package com.example.plugin.localize;

public final class MyPluginLocalize {
    public static final String ID = "com.example.plugin.MyPluginLocalize";

    private static final LocalizeKey my_action_text =
        LocalizeKey.of(ID, "my.action.text");
    private static final LocalizeKey my_action_description =
        LocalizeKey.of(ID, "my.action.description");
    private static final LocalizeKey greeting_message =
        LocalizeKey.of(ID, "greeting.message", 2);

    public static LocalizeValue myActionText() {
        return my_action_text.getValue();
    }

    public static LocalizeValue myActionDescription() {
        return my_action_description.getValue();
    }

    public static LocalizeValue greetingMessage(
            @Nonnull Object arg0, @Nonnull Object arg1) {
        return greeting_message.getValue(arg0, arg1);
    }
}
```

### Generation Rules

| Aspect | Rule |
|---|---|
| **Class name** | Derived from the last segment of the YAML filename (e.g., `MyPluginLocalize`). |
| **Package** | Derived from the fully qualified name in the YAML filename. |
| **`ID` field** | A `public static final String` holding the full localize ID string. |
| **`LocalizeKey` fields** | One `private static` field per YAML key. Keys with placeholders pass the argument count (e.g., `LocalizeKey.of(ID, "greeting.message", 2)`). |
| **Accessor methods** | One `public static` method per key, returning `LocalizeValue`. The method name is the key converted to camelCase (dots removed, segments capitalized). |
| **Parameters** | Methods for keys containing `{0}`, `{1}`, ... placeholders accept corresponding `@Nonnull Object` arguments. |

## Key API Classes

### LocalizeValue

`consulo.localize.LocalizeValue` represents a localized text value. It implements `Supplier<String>`, so you can call `.get()` to obtain the resolved string.

**Source:** [`modules/base/localize-api/src/main/java/consulo/localize/LocalizeValue.java`](https://github.com/nicholasgasior/consulo/blob/master/modules/base/localize-api/src/main/java/consulo/localize/LocalizeValue.java)

Key methods and factories:

| Method | Description |
|---|---|
| `get()` | Returns the resolved localized string. |
| `getValue()` | Same as `get()`. |
| `map(Function)` | Transforms the string value via a mapping function. |
| `toUpperCase()` | Returns a `LocalizeValue` whose text is upper-cased. |
| `toLowerCase()` | Returns a `LocalizeValue` whose text is lower-cased. |
| `join(LocalizeValue...)` | Static method that concatenates multiple values. |
| `LocalizeValue.of("constant")` | Creates a `LocalizeValue` wrapping a constant string (not from YAML). |
| `LocalizeValue.empty()` | Returns an empty `LocalizeValue`. |
| `LocalizeValue.colon()` | Returns a `LocalizeValue` containing `": "`, useful as a separator with `join()`. |

### LocalizeKey

`consulo.localize.LocalizeKey` is a reference to a single localization entry. It is created internally by generated classes and resolves to a `LocalizeValue` at runtime.

**Source:** [`modules/base/localize-api/src/main/java/consulo/localize/LocalizeKey.java`](https://github.com/nicholasgasior/consulo/blob/master/modules/base/localize-api/src/main/java/consulo/localize/LocalizeKey.java)

Created via:

```java
LocalizeKey.of(localizeId, "key.name")       // no parameters
LocalizeKey.of(localizeId, "key.name", 2)     // with 2 parameters
```

Call `getValue()` (or `getValue(arg0, arg1)` for parameterized keys) to obtain the `LocalizeValue`.

### LocalizeManager

`consulo.localize.LocalizeManager` is the central service managing the current locale and available translations.

**Source:** [`modules/base/localize-api/src/main/java/consulo/localize/LocalizeManager.java`](https://github.com/nicholasgasior/consulo/blob/master/modules/base/localize-api/src/main/java/consulo/localize/LocalizeManager.java)

Obtain the singleton with `LocalizeManager.get()`.

| Method | Description |
|---|---|
| `getLocale()` | Returns the currently active locale. |
| `setLocale(locale)` | Switches the active locale at runtime. |
| `getAvaliableLocales()` | Returns a collection of all locales for which translations are available. |

## Using Localized Strings

### Direct Usage

```java
// Get the localized string
String text = MyPluginLocalize.myActionText().get();
```

### With Parameters

```java
LocalizeValue message = MyPluginLocalize.greetingMessage("User", 5);
String formatted = message.get(); // "Hello, User! You have 5 items."
```

### In Actions

Consulo actions accept `LocalizeValue` directly in their constructors:

```java
public class MyAction extends AnAction {
    public MyAction() {
        super(
            MyPluginLocalize.myActionText(),
            MyPluginLocalize.myActionDescription(),
            icon
        );
    }
}
```

### Constant Values (Not from YAML)

When you need a `LocalizeValue` that is not backed by a YAML entry:

```java
LocalizeValue constant = LocalizeValue.of("Some text");
LocalizeValue empty = LocalizeValue.empty();
```

### Joining Values

Combine multiple `LocalizeValue` instances with separators:

```java
LocalizeValue joined = LocalizeValue.join(
    value1, LocalizeValue.colon(), value2
);
```

## Multi-locale Support and Translation Plugins

### Adding Translations

The default locale is `en_US`. To provide translations for additional locales, create corresponding subdirectories under `LOCALIZE-LIB/`:

```
LOCALIZE-LIB/
├── en_US/
│   └── com.example.plugin.MyPluginLocalize.yaml
├── ru/
│   └── com.example.plugin.MyPluginLocalize.yaml
└── zh_CN/
    └── com.example.plugin.MyPluginLocalize.yaml
```

Each locale directory contains YAML files with the same keys but translated `text` values.

### Translation Plugins

Translations for other locales are typically distributed as separate **translation plugins**. A translation plugin bundles `LOCALIZE-LIB/<locale>/` directories containing YAML files for one or more locales.

### Fallback Behavior

If a key is not found in the current locale, the system falls back to the `en_US` default. This means you only need to provide translations for strings that differ from English.

### Switching Locale at Runtime

```java
LocalizeManager manager = LocalizeManager.get();

// Query available locales
Collection<?> locales = manager.getAvaliableLocales();

// Switch locale
manager.setLocale(newLocale);
```

When the locale changes, cached `LocalizeValue` instances automatically refresh through modification count tracking. Code holding references to `LocalizeValue` objects does not need to re-fetch them after a locale switch.

## Sub-files Support

For longer text content such as inspection descriptions or HTML fragments, place files in a subdirectory named after the Localize class:

```
LOCALIZE-LIB/
└── en_US/
    ├── com.example.plugin.MyPluginLocalize.yaml
    └── com.example.plugin.MyPluginLocalize/
        └── inspection/
            └── MyInspection.html
```

These files are loaded as `LocalizeTextFromFile` entries and accessed through the same key mechanism used for regular YAML-defined strings.
