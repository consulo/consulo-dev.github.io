---
title: File View Providers
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

A file view provider (`FileViewProvider`) manages access to multiple PSI trees within a single file.

For example, a JSPX page has a separate PSI tree for the Java code in it (`PsiJavaFile`), a separate tree for the XML code (`XmlFile`), and a separate tree for JSP as a whole (`JspFile`).

Each of the PSI trees covers the entire contents of the file and contains special "outer language elements" in the places where contents in a different language can be found.

A `FileViewProvider` instance corresponds to a single [`VirtualFile`](https://github.com/consulo/consulo/blob/master/modules/base/virtual-file-system-api/src/main/java/consulo/virtualFileSystem/VirtualFile.java), a single [`Document`](https://github.com/consulo/consulo/blob/master/modules/base/document-api/src/main/java/consulo/document/Document.java), and can retrieve multiple [`PsiFile`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiFile.java) instances.

## How do I get a FileViewProvider?

* From a `VirtualFile`: [`PsiManager.getInstance(project).findViewProvider()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiManager.java)
* From a `PsiFile`: `psiFile.getViewProvider()`

## What can I do with a FileViewProvider?

* To get the set of all languages for which PSI trees exist in a file: `fileViewProvider.getLanguages()`
* To get the PSI tree for a particular language: `fileViewProvider.getPsi(language)`.
  For example, to get the PSI tree for XML, use `fileViewProvider.getPsi(XMLLanguage.INSTANCE)`.
* To find an element of a particular language at the specified offset in the file: `fileViewProvider.findElementAt(offset, language)`

## How do I extend the FileViewProvider?

To create a file type that has multiple interspersing trees for different languages, a plugin must implement `FileViewProviderFactory` and return your `FileViewProvider` implementation from `createFileViewProvider()` method.

Register the factory by annotating the implementation class with `@ExtensionImpl`:

```java
@ExtensionImpl
public class MyFileViewProviderFactory implements FileViewProviderFactory {
    @Override
    public FileViewProvider createFileViewProvider(VirtualFile file, Language language, PsiManager manager, boolean eventSystemEnabled) {
        return new MyFileViewProvider(manager, file, eventSystemEnabled);
    }
}
```
