---
title: Structure View
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The Structure View implementation used for a specific file type can be customized on many levels.
If a custom language plugin provides an implementation of the `StructureView` interface, it can completely replace the standard structure view implementation with a custom user interface component.
However, for most languages, this is not necessary, and the standard `StructureView` implementation provided by *Consulo* can be reused.

The starting point for the structure view is the [`PsiStructureViewFactory`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/structureView/PsiStructureViewFactory.java) interface, with the implementation annotated with `@ExtensionImpl`.

**Examples:**
- [`PsiStructureViewFactory`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/structureView/PsiStructureViewFactory.java) for Properties language plugin
- [Custom Language Support Tutorial: Structure View](/tutorials/custom_language_support/structure_view_factory.md)

To reuse the *Consulo* implementation of the `StructureView`, the plugin returns a [`TreeBasedStructureViewBuilder`](https://github.com/consulo/consulo/blob/master/modules/base/file-editor-api/src/main/java/consulo/fileEditor/structureView/TreeBasedStructureViewBuilder.java) (`consulo.fileEditor.structureView.TreeBasedStructureViewBuilder`) from its [`PsiStructureViewFactory.getStructureViewBuilder()`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/structureView/PsiStructureViewFactory.java) method.
As the builder model, the plugin can specify a subclass of [`TextEditorBasedStructureViewModel`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/structureView/TextEditorBasedStructureViewModel.java), and by overriding methods of this subclass, it customizes the structure view for a specific language.

**Example**:
`StructureViewModel` for Properties language plugin


The main method to override is `getRoot()`, which returns the instance of a class implementing the [`StructureViewTreeElement`](https://github.com/consulo/consulo/blob/master/modules/base/file-editor-api/src/main/java/consulo/fileEditor/structureView/StructureViewTreeElement.java) interface.
There exists no standard implementation of this interface, so a plugin will need to implement it completely.

The structure view tree is usually built as a partial mirror of the PSI tree.
In the implementation of [`StructureViewTreeElement.getChildren()`](https://github.com/consulo/consulo/blob/master/modules/base/file-editor-api/src/main/java/consulo/fileEditor/structureView/StructureViewTreeElement.java), the plugin can specify which of the child elements of a specific PSI tree node need to be represented as elements in the structure view.
Another important method is `getPresentation()`, which can be used to customize the text, attributes, and icon used to represent an element in the structure view.

The implementation of [`StructureViewTreeElement.getChildren()`](https://github.com/consulo/consulo/blob/master/modules/base/file-editor-api/src/main/java/consulo/fileEditor/structureView/StructureViewTreeElement.java) needs to be matched by [`TextEditorBasedStructureViewModel.getSuitableClasses()`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/structureView/TextEditorBasedStructureViewModel.java).
The latter method returns an array of [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java)\-derived classes, which can be shown as structure view elements.
It is used to select the Structure View item matching the cursor position when the structure view is first opened or when the _Autoscroll from source_ option is enabled.

**Example:**
[`StructureViewTreeElement`](https://github.com/consulo/consulo/blob/master/modules/base/file-editor-api/src/main/java/consulo/fileEditor/structureView/StructureViewTreeElement.java) for Properties language plugin
