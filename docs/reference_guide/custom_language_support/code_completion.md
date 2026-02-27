---
title: Code Completion
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Two main types of code completion can be provided by custom language plugins: reference completion and contributor-based completion.

Reference completion is easier to implement, but supports only the basic completion action.
Contributor-based completion provides more features, supports all three completion types (basic, smart, and class name), and can be used, for example, to implement keyword completion.

### Reference Completion

To fill the completion list, the IDE calls [`PsiReference.getVariants()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiReference.java) either on the reference at the caret location or on a dummy reference that would be placed at the caret.
This method needs to return an array of objects containing either strings, [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java) instances or instances of the [`LookupElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/completion/lookup/LookupElement.java) (`consulo.language.editor.completion.lookup.LookupElement`) class (see [Lookup Items](#lookup-items) below).
If a [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java) instance is returned in the array, the completion list shows the icon for the element.

The most common way to implement `getVariants()` is to use the same function for walking up the tree as in [`PsiReference.resolve()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiReference.java), and a different implementation of [`PsiScopeProcessor`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/resolve/PsiScopeProcessor.java) which collects all declarations passed to its `processDeclarations()` method and returns them as an array for filling the completion list.

### Contributor-Based Completion

Implementing the [`CompletionContributor`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/completion/CompletionContributor.java) (`consulo.language.editor.completion.CompletionContributor`) interface gives you the greatest control over the operation of code completion for your language.

> **NOTE** Note that the JavaDoc of that class contains a detailed FAQ for implementing code completion.

The core scenario of using `CompletionContributor` consists of calling the `extend()` method and passing in the *pattern* specifying the context in which this completion variant is applicable, as well as a *completion provider* which generates the items to show in the completion list.

Keep in mind that the pattern is checked against the leaf PSI element.
If you want to match a composite element, use `withParent()` or `withSuperParent()` methods.

**Examples**:
- `CompletionContributor` for completing keywords in MANIFEST.MF files.
- [Custom Language Support Tutorial: Completion Contributor](/tutorials/custom_language_support/completion_contributor.md)


### Lookup Items
Items shown in the completion list are represented by instances of the `LookupElement` (`consulo.language.editor.completion.lookup.LookupElement`) interface.
These instances are typically created through the [`LookupElementBuilder`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/completion/lookup/LookupElementBuilder.java) (`consulo.language.editor.completion.lookup.LookupElementBuilder`) class.

For every lookup element, you can specify the following attributes:

* Text. Shown left-aligned.
* Tail text. Shown next to the main item text, is not used for prefix matching, and can be used, for example, to show the parameter list of the method.
* Type text. Shown right-aligned in the lookup list and can be used to show the return type or containing class of a method, for example.
* Icon
* Text attributes. Bold, Strikeout, etc.
* Insert handler. The insert handler is a callback which is called when the item is selected and can be used to perform additional modifications of the text (for example, to put in the parentheses for a method call)
