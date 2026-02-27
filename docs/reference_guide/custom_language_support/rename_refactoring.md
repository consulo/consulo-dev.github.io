---
title: Rename Refactoring
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The Rename refactoring operation is quite similar to that of [Find Usages](find_usages.md).
It uses the same rules for locating the element to be renamed and the same index of words for finding the files that may have references to the element being renamed.

When the rename refactoring is performed, the method [`PsiNamedElement.setName()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiNamedElement.java) is called for the renamed element, and [`PsiReference.handleElementRename()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiReference.java) is called for all references to the renamed element.
These methods perform basically the same action: replace the underlying AST node of the PSI element with the node containing the new text entered by the user.
Creating an entirely correct AST node from scratch is quite tricky.
Thus, surprisingly, the easiest way to get the replacement node is to create a dummy file in the custom language so that it would contain the necessary node in its parse tree, build the parse tree and extract the required node from it.

**Examples:**
- `setName()` implementation for Properties language plugin
- [Custom Language Support Tutorial: Reference Contributor](/tutorials/custom_language_support/reference_contributor.md)

To disable renaming for specific elements, implement `consulo.util.lang.function.Condition<T>` for PsiElement of type `T` and register it in `consulo.vetoRenameCondition` extension point.

### Name Validation
[`NamesValidator`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-refactoring-api/src/main/java/consulo/language/editor/refactoring/NamesValidator.java) allows a plugin to check if the name entered by the user in the `Rename` dialog is a valid identifier (and not a keyword) according to the custom language rules.
If an implementation of this interface is not provided by the plugin, Java rules for validating identifiers are used.
Implementations of [`NamesValidator`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-refactoring-api/src/main/java/consulo/language/editor/refactoring/NamesValidator.java) are registered in the `consulo.namesValidator` extension point.

**Example**:
`PropertiesNamesValidator` for Properties language plugin


### Custom Rename UI and Workflow
Further customization of the Rename refactoring processing is possible on multiple levels.
Providing a custom implementation of the [`RenameHandler`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-refactoring-api/src/main/java/consulo/language/editor/refactoring/rename/RenameHandler.java) interface allows you to entirely replace the UI and workflow of the rename refactoring, and also to support renaming something which is not a [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java) at all.

**Example**:
[`RenameHandler`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-refactoring-api/src/main/java/consulo/language/editor/refactoring/rename/RenameHandler.java) for renaming a resource bundle in the Properties language plugin

If you're okay with the standard UI but need to extend the default logic of renaming, you can provide an implementation of the [`RenamePsiElementProcessor`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-refactoring-api/src/main/java/consulo/language/editor/refactoring/rename/RenamePsiElementProcessor.java) interface.
This allows you to:

* Rename an element different from the one on which the action was invoked (a super method, for example)
* Rename multiple elements at once (if their names are linked according to the logic of your language)
* Check for name conflicts (existing names, etc.)
* Customize how a search for code references or text references is performed
* etc.

**Example**:
[`RenamePsiElementProcessor`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-refactoring-api/src/main/java/consulo/language/editor/refactoring/rename/RenamePsiElementProcessor.java) for renaming a property in Properties language plugin
