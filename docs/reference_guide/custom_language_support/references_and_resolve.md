---
title: References and Resolve
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

One of the most important and tricky parts in implementing a custom language PSI is resolving references.
Resolving references gives users the ability to navigate from a PSI element usage (accessing a variable, calling a method, etc.) to the declaration of that element (the variable's definition, a method declaration, and so on).
This feature is needed in order to support the _Go to Declaration_ action invoked by **Ctrl-B** and **Ctrl-Click**, and it is a prerequisite for implementing the [Find Usages](find_usages.md) action, the [Rename Refactoring](rename_refactoring.md) and [Code Completion](code_completion.md).

::: info
The _Quick Definition_ action is based on the same mechanism, so it becomes automatically available for all references that can be resolved by the language plugin.
:::


All PSI elements which work as references (for which the _Go to Declaration_ action applies) need to implement the
[`PsiElement.getReference()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java) method and to return a [`PsiReference`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiReference.java) (`consulo.language.psi.PsiReference`) implementation from that method.
The [`PsiReference`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiReference.java) interface can be implemented by the same class as [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java) (`consulo.language.psi.PsiElement`), or by a different class.
An element can also contain multiple references (for example, a string literal can contain multiple substrings which are valid fully-qualified class names), in which case it can implement [`PsiElement.getReferences()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java) and return the references as an array.

The primary method of the [`PsiReference`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiReference.java) interface is `resolve()`, which returns the element to which the reference points, or `null` if it was not possible to resolve the reference to a valid element (for example, should it point to an undefined class).
The resolved element should implement the [`PsiNamedElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiNamedElement.java) interface.

::: info
While the referencing element and the referenced element both may have a name, only the element which **introduces** the name (e.g., the definition `int x = 42`) needs to implement the [`PsiNamedElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiNamedElement.java) interface.
The referencing element at the point of usage (e.g., the `x` in the expression `x + 1`) should not implement [`PsiNamedElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiNamedElement.java) since it does not _have_ a name.
:::


::: tip
In order to enable more advanced Consulo functionality, prefer implementing [`PsiNameIdentifierOwner`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiNameIdentifierOwner.java) over [`PsiNamedElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiNamedElement.java) where possible.
:::


A counterpart to the `resolve()` method is `isReferenceTo()`, which checks if the reference resolves to the specified element.
The latter method can be implemented by calling `resolve()` and comparing the result with the passed PSI element.
Still, additional optimizations are possible (for example, performing the tree walk only if the element text is equal to the text of the reference).


**Examples**:
- Reference to a localize key in the Consulo [localization system](/platform/ui/localization.md)
- [Custom Language Support Tutorial: Reference Contributor](/tutorials/custom_language_support/reference_contributor.md)

::: tip
To optimize `getReferences()` performance, consider implementing `HintedReferenceHost` to provide additional hints.
Please see also _Cache Results of Heavy Computations_ in [Working with PSI efficiently](/reference_guide/performance/performance.md#working-with-psi-efficiently).
:::


There are a set of interfaces that can be used as a base for implementing resolve support, namely the [`PsiScopeProcessor`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/resolve/PsiScopeProcessor.java) interface and the [`PsiElement.processDeclarations()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java) method.
These interfaces have several extra complexities that are unnecessary for most custom languages (like support for substituting Java generics types).
Still, they are required if the custom language can have references to Java code.
If Java interoperability is not required, the plugin can forgo the standard interfaces and provide its own, different implementation of resolve.

The implementation of resolve based on the standard helper classes contains the following components:

* A class implements the [`PsiScopeProcessor`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/resolve/PsiScopeProcessor.java) interface, which gathers the possible declarations for the reference and stops the resolve process when it has successfully completed.
  The primary method which needs to be implemented is `execute()`, which is called to process every declaration encountered during the resolve, and returns `true` if the resolve needs to be continued or `false` if the declaration has been found.
  The methods `getHint()` and `handleEvent()` are used for internal optimizations and can be left empty in the [`PsiScopeProcessor`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/resolve/PsiScopeProcessor.java) implementations for custom languages.
* A function which walks the PSI tree up from the reference location until the resolve has successfully completed or until the end of the resolve scope has been reached.
  If the target of the reference is located in a different file, the file can be located, for example, using `FilenameIndex.getFilesByName()` (if the file name is known) or by iterating through all custom language files in the project (`iterateContent()` in the `ProjectFileIndex` interface obtained from `ProjectRootManager.getFileIndex()`).
* The individual PSI elements, on which the `processDeclarations()` method is called during the PSI tree walk.
  If a PSI element is a declaration, it passes itself to the `execute()` method of the [`PsiScopeProcessor`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/resolve/PsiScopeProcessor.java) passed to it.
  Also, if necessary, according to the language scoping rules, a PSI element can pass the [`PsiScopeProcessor`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/resolve/PsiScopeProcessor.java) to its child elements.

### Resolving to Multiple Targets
An extension of the [`PsiReference`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiReference.java) interface, which allows a reference to resolve to multiple targets, is the `PsiPolyVariantReference` interface.
The targets to which the reference resolves are returned from the `multiResolve()` method.
The _Go to Declaration_ action for such references allows the user to choose a navigation target.
The implementation of `multiResolve()` can be also based on [`PsiScopeProcessor`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/resolve/PsiScopeProcessor.java), and can collect all valid targets for the reference instead of stopping when the first valid target is found.
