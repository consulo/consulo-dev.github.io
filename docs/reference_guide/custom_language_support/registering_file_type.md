---
title: Registering a File Type
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The first step in developing a custom language plugin is registering a file type associated with the language.

The IDE typically determines the type of a file by looking at its file name or extension.

A custom language file type is a class derived from [`LanguageFileType`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/file/LanguageFileType.java) (`consulo.language.file.LanguageFileType`), which passes a [`Language`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/Language.java) (`consulo.language.Language`) subclass to its base class constructor.

To register a file type, the plugin developer annotates the `LanguageFileType` subclass with `@ExtensionImpl`. The base class `LanguageFileType` is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`.

**Examples**:
- `LanguageFileType` subclass in Properties language plugin
- [Custom Language Support Tutorial: Language and File Type](/tutorials/custom_language_support/language_and_filetype.md)

To verify that the file type is registered correctly, you can implement the `LanguageFileType.getIcon()` method and verify that the correct icon (see [Working with Icons and Images](/reference_guide/work_with_icons_and_images.md)) is displayed for files associated with your file type.
                                         
To control file type association with the IDE in the operating system, implement `consulo.virtualFileSystem.fileType.OSFileIdeAssociation` (2020.3).