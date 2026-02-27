---
title: Navigation Bar
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The navigation bar is a breadcrumb-like UI component displayed at the top of the editor area, showing the structural context of the currently focused file or element.
It allows users to quickly navigate through the project hierarchy -- from the project root down to the current file and its inner structure (classes, methods, etc.).

A custom language plugin can extend the navigation bar by implementing the [`NavBarModelExtension`](https://github.com/consulo/consulo/blob/master/modules/base/ide-api/src/main/java/consulo/ide/navigationToolbar/NavBarModelExtension.java) (`consulo.ide.navigationToolbar.NavBarModelExtension`) interface.

## NavBarModelExtension

`NavBarModelExtension` is an interface annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`.
It allows plugins to customize how elements are presented in the navigation bar, define parent-child relationships, contribute additional root elements, and control child processing.

The platform provides a default implementation (`DefaultNavBarExtension`) which is registered last.
Custom implementations are called before the default one, with the exception of the `adjustElement()` method where the order is reversed.

### Key Methods

* **`getPresentableText(Object object)`** -- Returns the text to display in the navigation bar for the given object, or `null` if this extension does not handle the object.

* **`getPresentableText(Object object, boolean forPopup)`** -- Returns the presentable text, optionally adjusted for display in a popup context. By default, delegates to `getPresentableText(Object)`.

* **`getParent(PsiElement psiElement)`** -- Returns the parent element in the navigation hierarchy for the given PSI element, or `null` if this extension does not handle the element.

* **`adjustElement(PsiElement psiElement)`** -- Adjusts the given PSI element before it is displayed in the navigation bar. This can be used to normalize or replace elements (for example, replacing a method body element with the method itself). Note that the call order for this method is reversed compared to other methods -- the default extension is called first.

* **`additionalRoots(Project project)`** -- Returns a collection of additional `VirtualFile` roots to include in the navigation bar model beyond the default project roots.

* **`getData(Key<?> dataId, DataProvider provider)`** -- Provides custom data for the navigation bar context. Returns `null` by default.

* **`getPopupMenuGroup(DataProvider provider)`** -- Returns the action group ID for the popup menu shown when right-clicking a navigation bar element. Returns `null` by default.

* **`getLeafElement(DataContext dataContext)`** -- Returns the leaf PSI element for the given data context. This determines which element is shown as the rightmost (deepest) breadcrumb. Returns `null` by default.

* **`processChildren(Object object, Object rootElement, Predicate<Object> processor)`** -- Processes the children of the given object in the navigation bar tree. The `processor` predicate is called for each child; return `false` from `processChildren` to indicate that this extension handled the children and the default processing should be skipped. Returns `true` by default (meaning default processing proceeds).

* **`normalizeChildren()`** -- Returns `true` if the children returned by this extension should be normalized (deduplicated and sorted). Default is `true`.

## Registration

To register a navigation bar model extension for your custom language or framework, implement the `NavBarModelExtension` interface and annotate your class with `@ExtensionImpl`.

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.ide.navigationToolbar.NavBarModelExtension;
import consulo.language.psi.PsiElement;
import consulo.project.Project;
import consulo.virtualFileSystem.VirtualFile;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

import java.util.Collection;
import java.util.Collections;

@ExtensionImpl
public class MyLanguageNavBarExtension implements NavBarModelExtension {

    @Nullable
    @Override
    public String getPresentableText(Object object) {
        if (object instanceof MyClassElement myClass) {
            return myClass.getName();
        }
        if (object instanceof MyFunctionElement myFunc) {
            return myFunc.getName() + "()";
        }
        return null;
    }

    @Nullable
    @Override
    public PsiElement getParent(@Nonnull PsiElement psiElement) {
        if (psiElement instanceof MyFunctionElement) {
            return psiElement.getParent(); // Return containing class
        }
        return null;
    }

    @Nullable
    @Override
    public PsiElement adjustElement(PsiElement psiElement) {
        // Normalize block elements to their parent declaration
        if (psiElement instanceof MyBlockElement) {
            return psiElement.getParent();
        }
        return psiElement;
    }

    @Override
    public Collection<VirtualFile> additionalRoots(Project project) {
        return Collections.emptyList();
    }
}
```

In this example, the extension provides presentable text for custom class and function elements, resolves parent relationships for functions, and adjusts block elements to show their parent declarations in the navigation bar.
