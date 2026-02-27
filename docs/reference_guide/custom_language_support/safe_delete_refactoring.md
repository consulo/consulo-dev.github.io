---
title: Safe Delete Refactoring
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The _Safe Delete_ refactoring also builds on the same [Find Usages](find_usages.md) framework as [Rename Refactoring](rename_refactoring.md).

In addition to that, to support _Safe Delete_, a plugin needs to implement two things:

*  The
   [`RefactoringSupportProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-refactoring-api/src/main/java/consulo/language/editor/refactoring/RefactoringSupportProvider.java) (`consulo.language.editor.refactoring.RefactoringSupportProvider`)
   abstract class, annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`, with the `isSafeDeleteAvailable()` method returning `true` for elements that support safe deletion.

*  The
   [`PsiElement.delete()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java)
   method for the
   [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java)
   subclasses for which _Safe Delete_ is available.
   Deleting PSI elements is implemented by deleting the underlying AST nodes from the AST tree (which, in turn, causes the text ranges corresponding to the AST nodes to be deleted from the document).

## RefactoringSupportProvider

[`RefactoringSupportProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-refactoring-api/src/main/java/consulo/language/editor/refactoring/RefactoringSupportProvider.java) (`consulo.language.editor.refactoring.RefactoringSupportProvider`) is an abstract class annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`. It implements `LanguageExtension`, so each implementation is associated with a specific `Language`. It controls which refactoring operations are available for files in your language.

Key methods relevant to _Safe Delete_:

| Method | Description |
|--------|-------------|
| `isSafeDeleteAvailable(PsiElement element)` | Returns `true` if the Safe Delete refactoring is available for the specified PSI element. Defaults to `false`. |
| `isAvailable(PsiElement context)` | Returns `true` if refactoring support is available in the given context. Allows multiple providers for the same language. Defaults to `true`. |

Additional refactoring methods provided by `RefactoringSupportProvider`:

| Method | Description |
|--------|-------------|
| `isInplaceRenameAvailable(PsiElement element, PsiElement context)` | Returns `true` if in-place rename is available. |
| `isMemberInplaceRenameAvailable(PsiElement element, PsiElement context)` | Returns `true` if in-place member rename is available. |
| `isInplaceIntroduceAvailable(PsiElement element, PsiElement context)` | Returns `true` if in-place introduce refactoring is available. |
| `getIntroduceVariableHandler()` | Returns the handler for introducing local variables. |
| `getExtractMethodHandler()` | Returns the handler for extracting methods. |
| `getIntroduceConstantHandler()` | Returns the handler for introducing constants. |
| `getIntroduceFieldHandler()` | Returns the handler for introducing fields. |
| `getIntroduceParameterHandler()` | Returns the handler for introducing parameters. |
| `getPullUpHandler()` | Returns the handler for pulling up members. |
| `getPushDownHandler()` | Returns the handler for pushing down members. |
| `getExtractInterfaceHandler()` | Returns the handler for extracting interfaces. |
| `getExtractSuperClassHandler()` | Returns the handler for extracting super classes. |
| `getExtractClassHandler()` | Returns the handler for extracting delegate classes. |
| `getExtractModuleHandler()` | Returns the handler for extracting modules. |
| `getChangeSignatureHandler()` | Returns the handler for changing method signatures. |

### Registering RefactoringSupportProvider

Extend `RefactoringSupportProvider` and annotate the implementation class with `@ExtensionImpl`:

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.language.Language;
import consulo.language.editor.refactoring.RefactoringSupportProvider;
import consulo.language.psi.PsiElement;
import consulo.myLanguage.MyLanguage;
import consulo.myLanguage.psi.MyNamedElement;

import jakarta.annotation.Nonnull;

@ExtensionImpl
public class MyLanguageRefactoringSupportProvider extends RefactoringSupportProvider {
    @Nonnull
    @Override
    public Language getLanguage() {
        return MyLanguage.INSTANCE;
    }

    @Override
    public boolean isSafeDeleteAvailable(PsiElement element) {
        return element instanceof MyNamedElement;
    }
}
```

## SafeDeleteProcessorDelegate

For more advanced customization of the _Safe Delete_ behavior, implement [`SafeDeleteProcessorDelegate`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-refactoring-api/src/main/java/consulo/language/editor/refactoring/safeDelete/SafeDeleteProcessorDelegate.java) (`consulo.language.editor.refactoring.safeDelete.SafeDeleteProcessorDelegate`). This interface is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`.

`SafeDeleteProcessorDelegate` allows you to control how references are searched, what additional elements are deleted, and how conflicts are reported. All methods:

| Method | Description |
|--------|-------------|
| `handlesElement(PsiElement element)` | Returns `true` if this delegate handles the given element type. |
| `findUsages(PsiElement element, PsiElement[] allElementsToDelete, List<UsageInfo> result)` | Finds usages of the element to be deleted. Returns a `NonCodeUsageSearchInfo` describing how non-code usages should be handled, or `null`. |
| `getElementsToSearch(PsiElement element, Collection<PsiElement> allElementsToDelete)` | Called before the refactoring dialog is shown. Returns additional elements to search for usages, or `null` if the user cancels. May show UI to ask the user about additional elements to delete. |
| `getAdditionalElementsToDelete(PsiElement element, Collection<PsiElement> allElementsToDelete, boolean askUser)` | Returns additional PSI elements that should also be deleted when the given element is deleted, or `null`. |
| `findConflicts(PsiElement element, PsiElement[] allElementsToDelete)` | Returns a collection of conflict descriptions, or `null` if there are no conflicts. |
| `preprocessUsages(Project project, UsageInfo[] usages)` | Called after the user confirms the refactoring. Can filter usages or show UI to exclude certain usages. Returns the filtered array of usages, or `null` if the user cancels. |
| `prepareForDeletion(PsiElement element)` | Called before the element is actually deleted. Use this to clean up references or perform pre-deletion updates. |
| `isToSearchInComments(PsiElement element)` | Returns `true` if text occurrences in comments should be searched. |
| `setToSearchInComments(PsiElement element, boolean enabled)` | Sets whether to search in comments for this element type. |
| `isToSearchForTextOccurrences(PsiElement element)` | Returns `true` if text occurrences in string literals and other non-code places should be searched. |
| `setToSearchForTextOccurrences(PsiElement element, boolean enabled)` | Sets whether to search for text occurrences for this element type. |

### Registering SafeDeleteProcessorDelegate

Implement the interface and annotate with `@ExtensionImpl`:

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.language.editor.refactoring.safeDelete.SafeDeleteProcessorDelegate;
import consulo.language.editor.refactoring.safeDelete.NonCodeUsageSearchInfo;
import consulo.language.psi.PsiElement;
import consulo.language.util.IncorrectOperationException;
import consulo.localize.LocalizeValue;
import consulo.project.Project;
import consulo.usage.UsageInfo;
import consulo.myLanguage.psi.MyNamedElement;

import jakarta.annotation.Nullable;
import java.util.Collection;
import java.util.List;

@ExtensionImpl
public class MyLanguageSafeDeleteProcessorDelegate implements SafeDeleteProcessorDelegate {
    @Override
    public boolean handlesElement(PsiElement element) {
        return element instanceof MyNamedElement;
    }

    @Nullable
    @Override
    public NonCodeUsageSearchInfo findUsages(PsiElement element,
                                             PsiElement[] allElementsToDelete,
                                             List<UsageInfo> result) {
        // Use SafeDeleteProcessor utilities to collect usages
        return null;
    }

    @Nullable
    @Override
    public Collection<? extends PsiElement> getElementsToSearch(
            PsiElement element, Collection<PsiElement> allElementsToDelete) {
        return List.of(element);
    }

    @Nullable
    @Override
    public Collection<PsiElement> getAdditionalElementsToDelete(
            PsiElement element, Collection<PsiElement> allElementsToDelete,
            boolean askUser) {
        return null;
    }

    @Nullable
    @Override
    public Collection<LocalizeValue> findConflicts(PsiElement element,
                                                   PsiElement[] allElementsToDelete) {
        return null;
    }

    @Nullable
    @Override
    public UsageInfo[] preprocessUsages(Project project, UsageInfo[] usages) {
        return usages;
    }

    @Override
    public void prepareForDeletion(PsiElement element)
            throws IncorrectOperationException {
        // Clean up before deletion
    }

    @Override
    public boolean isToSearchInComments(PsiElement element) {
        return false;
    }

    @Override
    public void setToSearchInComments(PsiElement element, boolean enabled) {
    }

    @Override
    public boolean isToSearchForTextOccurrences(PsiElement element) {
        return false;
    }

    @Override
    public void setToSearchForTextOccurrences(PsiElement element, boolean enabled) {
    }
}
```

## Summary

To fully support _Safe Delete_ in a custom language plugin:

1. Extend `RefactoringSupportProvider`, annotate with `@ExtensionImpl`, and return `true` from `isSafeDeleteAvailable()` for the element types that can be safely deleted.
2. Implement `PsiElement.delete()` for those PSI element types.
3. Optionally implement `SafeDeleteProcessorDelegate` (annotated with `@ExtensionImpl`) for advanced control over usage searching, conflict detection, and pre-deletion cleanup.
