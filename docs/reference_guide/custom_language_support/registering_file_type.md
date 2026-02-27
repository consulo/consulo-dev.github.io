---
title: Registering a File Type
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The first step in developing a custom language plugin is registering a file type associated with the language.

The IDE typically determines the type of a file by looking at its file name or extension.

## FileType Interface

[`FileType`](https://github.com/consulo/consulo/blob/master/modules/base/virtual-file-system-api/src/main/java/consulo/virtualFileSystem/fileType/FileType.java) (`consulo.virtualFileSystem.fileType.FileType`) is the base interface for all file types. It defines:

| Method | Description |
|--------|-------------|
| `getId()` | Returns the unique identifier for this file type. Must be unique across all registered file types. |
| `getDisplayName()` | Returns the user-readable display name. By default returns a `LocalizeValue` of the ID. |
| `getDescription()` | Returns the user-readable description. Deprecated in favor of `getDisplayName()`. |
| `getDefaultExtension()` | Returns the default file extension (without the leading dot). |
| `getIcon()` | Returns the icon used for showing files of this type. |
| `isBinary()` | Returns `true` if files of this type contain binary data. Used for source control, to-do scanning, and other purposes. |
| `isReadOnly()` | Returns `true` if this file type is read-only. Read-only file types are not shown in the "File Types" settings dialog. |
| `getCharset(VirtualFile file, byte[] content)` | Returns the character set for the specified file. |

## LanguageFileType

A custom language file type is a class derived from [`LanguageFileType`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/file/LanguageFileType.java) (`consulo.language.file.LanguageFileType`), which passes a [`Language`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/Language.java) (`consulo.language.Language`) subclass to its base class constructor.

`LanguageFileType` extends `FileType` and adds language association:

| Method | Description |
|--------|-------------|
| `LanguageFileType(Language language)` | Creates a language file type for the specified language. |
| `LanguageFileType(Language language, boolean secondary)` | Creates a language file type. If `secondary` is `true`, this file type will never be returned as the associated file type for the language. Used when a file type reuses the language of another file type. |
| `getLanguage()` | Returns the `Language` instance associated with this file type. |
| `isSecondary()` | Returns `true` if this is a secondary file type for its language. |
| `extractCharsetFromFileContent(Project project, VirtualFile file, CharSequence content)` | Override to extract the charset from file content (e.g., for files that declare their encoding in a header). |

## Registration with @ExtensionImpl

To register a file type, implement a `FileTypeFactory` subclass annotated with `@ExtensionImpl`. The [`FileTypeFactory`](https://github.com/consulo/consulo/blob/master/modules/base/virtual-file-system-api/src/main/java/consulo/virtualFileSystem/fileType/FileTypeFactory.java) (`consulo.virtualFileSystem.fileType.FileTypeFactory`) base class is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`.

The `FileTypeFactory` defines a single method:

| Method | Description |
|--------|-------------|
| `createFileTypes(FileTypeConsumer consumer)` | Called during initialization. Use the `consumer` to register file types with their associated extensions or matchers. |

The [`FileTypeConsumer`](https://github.com/consulo/consulo/blob/master/modules/base/virtual-file-system-api/src/main/java/consulo/virtualFileSystem/fileType/FileTypeConsumer.java) provides three `consume` overloads:

| Method | Description |
|--------|-------------|
| `consume(FileType fileType)` | Registers the file type with its default extension. |
| `consume(FileType fileType, String extensions)` | Registers the file type with a semicolon-delimited list of extensions. |
| `consume(FileType fileType, FileNameMatcher... matchers)` | Registers the file type with custom file name matchers for advanced matching. |

### Example

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.virtualFileSystem.fileType.FileTypeConsumer;
import consulo.virtualFileSystem.fileType.FileTypeFactory;

import jakarta.annotation.Nonnull;

@ExtensionImpl
public class MyLanguageFileTypeFactory extends FileTypeFactory {
    @Override
    public void createFileTypes(@Nonnull FileTypeConsumer consumer) {
        consumer.consume(MyLanguageFileType.INSTANCE, "mylang");
    }
}
```

Where `MyLanguageFileType` is defined as:

```java
import consulo.language.file.LanguageFileType;
import consulo.localize.LocalizeValue;
import consulo.ui.image.Image;

import jakarta.annotation.Nonnull;

public class MyLanguageFileType extends LanguageFileType {
    public static final MyLanguageFileType INSTANCE = new MyLanguageFileType();

    private MyLanguageFileType() {
        super(MyLanguage.INSTANCE);
    }

    @Nonnull
    @Override
    public String getId() {
        return "MY_LANGUAGE";
    }

    @Nonnull
    @Override
    public LocalizeValue getDescription() {
        return LocalizeValue.localizeTODO("My Language file");
    }

    @Nonnull
    @Override
    public String getDefaultExtension() {
        return "mylang";
    }

    @Nonnull
    @Override
    public Image getIcon() {
        return MyLanguageIcons.FILE;
    }
}
```

## File Type Detection by Content

For cases where a file type cannot be determined by extension alone, implement [`FileTypeDetector`](https://github.com/consulo/consulo/blob/master/modules/base/virtual-file-system-api/src/main/java/consulo/virtualFileSystem/fileType/FileTypeDetector.java) (`consulo.virtualFileSystem.fileType.FileTypeDetector`), annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`:

| Method | Description |
|--------|-------------|
| `detect(VirtualFile file, ByteSequence firstBytes, CharSequence firstCharsIfText)` | Detects file type by content. `firstBytes` contains the initial bytes of the file. `firstCharsIfText` contains the text conversion if the content is text, or `null` otherwise. Returns the detected `FileType` or `null`. |
| `getDetectedFileTypes()` | Returns the collection of file types this detector can detect, or `null` if it can detect multiple types. |
| `getDesiredContentPrefixLength()` | Returns the number of leading bytes needed for reliable detection. Defaults to 1024. |
| `getVersion()` | Returns the detector version. Increment when detection logic changes. |

Another approach is to implement [`FileTypeIdentifiableByVirtualFile`](https://github.com/consulo/consulo/blob/master/modules/base/virtual-file-system-api/src/main/java/consulo/virtualFileSystem/fileType/FileTypeIdentifiableByVirtualFile.java) (`consulo.virtualFileSystem.fileType.FileTypeIdentifiableByVirtualFile`) in your `FileType` implementation. This interface adds a single method `isMyFileType(VirtualFile file)` that allows determining the file type based on the virtual file itself (e.g., by examining the file path or name patterns).

## Verification

To verify that the file type is registered correctly, implement the `getIcon()` method in your `LanguageFileType` subclass and verify that the correct icon (see [Working with Icons and Images](/reference_guide/work_with_icons_and_images.md)) is displayed for files associated with your file type.

**Examples**:
- [Custom Language Support Tutorial: Language and File Type](/tutorials/custom_language_support/language_and_filetype.md)
