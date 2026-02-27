---
title: Safe Delete Refactoring
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The _Safe Delete_ refactoring also builds on the same [Find Usages](find_usages.md) framework as [Rename Refactoring](rename_refactoring.md).

In addition to that, to support _Safe Delete_, a plugin needs to implement two things:

*  The
   [`RefactoringSupportProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-refactoring-api/src/main/java/consulo/language/editor/refactoring/RefactoringSupportProvider.java) (`consulo.language.editor.refactoring.RefactoringSupportProvider`)
   interface, registered in the `consulo.refactoringSupport` extension point, and the `isSafeDeleteAvailable()` method, which checks if the _Safe Delete_ refactoring is available for a specific PSI element

*  The
   [`PsiElement.delete()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java)
   method for the
   [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java)
   subclasses for which _Safe Delete_ is available.
   Deleting PSI elements is implemented by deleting the underlying AST nodes from the AST tree (which, in turn, causes the text ranges corresponding to the AST nodes to be deleted from the document).


**Example:**
`delete()` implementation for a Property in Properties language plugin

If needed, it's possible to further customize how _Safe Delete_ is performed for a particular type of element (e.g., how references are searched) via `SafeDeleteProcessorDelegate`.

**Example**:
`SafeDeleteProcessorDelegate` implementation for Properties language plugin
