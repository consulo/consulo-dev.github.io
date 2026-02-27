---
title: 2. Language and File Type
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The Consulo determines file type by examining the name of a file.
Each language has [Language](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/Language.java) and [LanguageFileType](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/file/LanguageFileType.java) objects defining the language.
Register the `LanguageFileType` with the Consulo by annotating the implementation class with `@ExtensionImpl`.

**Reference**: [Registering a File Type](/reference_guide/custom_language_support/registering_file_type.md)

* bullet item
{:toc}

## 2.1. Define the Language
The language implemented in this tutorial is named "Simple" - note the case of the name.
The `SimpleLanguage` class is defined in the `org.intellij.sdk.language` package of the `simple_language_plugin` code sample:

```java
{% include /code_samples/simple_language_plugin/src/main/java/org/intellij/sdk/language/SimpleLanguage.java %}
```

## 2.2. Define an Icon
The icon for the Simple Language is defined by the `SimpleIcons` class.
There is nothing uniquely Simple Language-specific about [defining the icon](/reference_guide/work_with_icons_and_images.md) itself.
The definition follows a pattern similar to defining, e.g., `SdkIcons`.

```java
{% include /code_samples/simple_language_plugin/src/main/java/org/intellij/sdk/language/SimpleIcons.java %}
```

## 2.3. Define a FileType
The Simple Language file type is defined by subclassing [`LanguageFileType`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/file/LanguageFileType.java):

```java
{% include /code_samples/simple_language_plugin/src/main/java/org/intellij/sdk/language/SimpleFileType.java %}
```

## 2.4. Register the FileType
The `LanguageFileType` base class is annotated with `@ExtensionAPI`. To register the file type with the Consulo, annotate the `SimpleFileType` implementation class with `@ExtensionImpl`.

## 2.5. Run the Project
Create an empty file with the extension `*.simple`, and Consulo automatically associates it with our language.
Note the appearance of the Simple Language file icon next to the `test.simple` file in the **Project Tool Window**, and the editor tab for the file.

![File Type Factory](img/file_type_factory.png){:width="800px"}
