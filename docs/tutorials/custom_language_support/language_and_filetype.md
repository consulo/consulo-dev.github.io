---
title: 2. Language and File Type
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The Consulo determines file type by examining the name of a file.
Each language has [Language](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/Language.java) and [LanguageFileType](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/file/LanguageFileType.java) objects defining the language.
Register the `LanguageFileType` with the Consulo by annotating the implementation class with `@ExtensionImpl`.

**Reference**: [Registering a File Type](/reference_guide/custom_language_support/registering_file_type.md)


## 2.1. Define the Language
The language implemented in this tutorial is named "Simple" - note the case of the name.
The `SimpleLanguage` class is defined in the `org.consulo.sdk.language` package of the `simple_language_plugin` code sample:

```java
package org.consulo.sdk.language;

import consulo.language.Language;

public class SimpleLanguage extends Language {

  public static final SimpleLanguage INSTANCE = new SimpleLanguage();

  private SimpleLanguage() {
    super("Simple");
  }

}
```

## 2.2. Define an Icon
The icon for the Simple Language is defined by the `SimpleIcons` class.
There is nothing uniquely Simple Language-specific about [defining the icon](/reference_guide/work_with_icons_and_images.md) itself.
The definition follows a pattern similar to defining, e.g., `SdkIcons`.

```java
package org.consulo.sdk.language;

import consulo.ui.image.Image;
import consulo.ui.image.ImageKey;

public class SimpleIcons {

  public static final Image FILE = ImageKey.of("SimplePlugin", "simple-file", 16, 16);

}
```

## 2.3. Define a FileType
The Simple Language file type is defined by subclassing [`LanguageFileType`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/file/LanguageFileType.java):

```java
package org.consulo.sdk.language;

import consulo.language.file.LanguageFileType;
import consulo.localize.LocalizeValue;
import consulo.ui.image.Image;

import jakarta.annotation.Nonnull;

public final class SimpleFileType extends LanguageFileType {

  public static final SimpleFileType INSTANCE = new SimpleFileType();

  private SimpleFileType() {
    super(SimpleLanguage.INSTANCE);
  }

  @Nonnull
  @Override
  public String getId() {
    return "Simple File";
  }

  @Nonnull
  @Override
  public LocalizeValue getDisplayName() {
    return LocalizeValue.localizeTODO("Simple language file");
  }

  @Nonnull
  @Override
  public String getDefaultExtension() {
    return "simple";
  }

  @Nonnull
  @Override
  public Image getIcon() {
    return SimpleIcons.FILE;
  }

}
```

## 2.4. Register the FileType
The `LanguageFileType` base class is annotated with `@ExtensionAPI`. To register the file type with the Consulo, annotate the `SimpleFileType` implementation class with `@ExtensionImpl`.

## 2.5. Run the Project
Create an empty file with the extension `*.simple`, and Consulo automatically associates it with our language.
Note the appearance of the Simple Language file icon next to the `test.simple` file in the **Project Tool Window**, and the editor tab for the file.

<img src="./img/file_type_factory.png" alt="File Type Factory" width="800" />
