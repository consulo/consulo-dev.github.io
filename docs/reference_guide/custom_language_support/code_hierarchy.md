---
title: Code Hierarchy
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Code hierarchy views allow developers to explore structural relationships in their code. Consulo supports three hierarchy views: **Type Hierarchy** (supertypes and subtypes of a class), **Method Hierarchy** (overriding and implementing methods across a class hierarchy), and **Call Hierarchy** (callers and callees of a method). Each view is provided by implementing a dedicated provider interface.

## HierarchyProvider

[`HierarchyProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/hierarchy/HierarchyProvider.java) is the base interface for all hierarchy providers. It implements `LanguageExtension` and defines three methods that every hierarchy provider must implement:

| Method | Description |
|--------|-------------|
| `getTarget(DataContext dataContext)` | Returns the PSI element for which the hierarchy should be displayed, based on the current action context. Returns `null` if the action is not applicable. |
| `createHierarchyBrowser(PsiElement target)` | Creates a `HierarchyBrowser` instance for viewing the hierarchy of the specified element. |
| `browserActivated(HierarchyBrowser hierarchyBrowser)` | Called when the hierarchy tool window is shown and the given browser is currently displayed. |

### HierarchyBrowser

[`HierarchyBrowser`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/hierarchy/HierarchyBrowser.java) represents the UI component displayed in the Hierarchy tool window. It defines:

| Method | Description |
|--------|-------------|
| `getComponent()` | Returns the `JComponent` to be displayed in the tool window. |
| `setContent(Content content)` | Notifies the browser that it is being displayed in the specified `Content` tab. |

## TypeHierarchyProvider

[`TypeHierarchyProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/hierarchy/TypeHierarchyProvider.java) is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)` and extends `HierarchyProvider`. It provides the Type Hierarchy view, which shows supertypes and subtypes of a selected class or type.

### Registration

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.dataContext.DataContext;
import consulo.language.Language;
import consulo.language.editor.hierarchy.HierarchyBrowser;
import consulo.language.editor.hierarchy.TypeHierarchyProvider;
import consulo.language.psi.PsiElement;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

@ExtensionImpl
public class MyTypeHierarchyProvider implements TypeHierarchyProvider {

    @Nonnull
    @Override
    public Language getLanguage() {
        return MyLanguage.INSTANCE;
    }

    @Nullable
    @Override
    public PsiElement getTarget(@Nonnull DataContext dataContext) {
        // Extract the class element from the data context
        // Return null if the caret is not on a class declaration
        return findTargetClass(dataContext);
    }

    @Nonnull
    @Override
    public HierarchyBrowser createHierarchyBrowser(PsiElement target) {
        // Create and return a browser component showing the type hierarchy
        return new MyTypeHierarchyBrowser(target);
    }

    @Override
    public void browserActivated(@Nonnull HierarchyBrowser hierarchyBrowser) {
        // Perform any setup needed when the browser is displayed
    }

    // ... helper methods omitted for brevity
}
```

## MethodHierarchyProvider

[`MethodHierarchyProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/hierarchy/MethodHierarchyProvider.java) is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)` and extends `HierarchyProvider`. It provides the Method Hierarchy view, which shows how a method is overridden or implemented across the type hierarchy.

### Registration

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.dataContext.DataContext;
import consulo.language.Language;
import consulo.language.editor.hierarchy.HierarchyBrowser;
import consulo.language.editor.hierarchy.MethodHierarchyProvider;
import consulo.language.psi.PsiElement;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

@ExtensionImpl
public class MyMethodHierarchyProvider implements MethodHierarchyProvider {

    @Nonnull
    @Override
    public Language getLanguage() {
        return MyLanguage.INSTANCE;
    }

    @Nullable
    @Override
    public PsiElement getTarget(@Nonnull DataContext dataContext) {
        // Extract the method element from the data context
        return findTargetMethod(dataContext);
    }

    @Nonnull
    @Override
    public HierarchyBrowser createHierarchyBrowser(PsiElement target) {
        return new MyMethodHierarchyBrowser(target);
    }

    @Override
    public void browserActivated(@Nonnull HierarchyBrowser hierarchyBrowser) {
        // Perform any setup needed when the browser is displayed
    }
}
```

## CallHierarchyProvider

[`CallHierarchyProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/hierarchy/CallHierarchyProvider.java) is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)` and extends `HierarchyProvider`. It provides the Call Hierarchy view, which shows the callers (and optionally callees) of a selected method.

### Registration

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.dataContext.DataContext;
import consulo.language.Language;
import consulo.language.editor.hierarchy.CallHierarchyProvider;
import consulo.language.editor.hierarchy.HierarchyBrowser;
import consulo.language.psi.PsiElement;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

@ExtensionImpl
public class MyCallHierarchyProvider implements CallHierarchyProvider {

    @Nonnull
    @Override
    public Language getLanguage() {
        return MyLanguage.INSTANCE;
    }

    @Nullable
    @Override
    public PsiElement getTarget(@Nonnull DataContext dataContext) {
        // Extract the method/function element from the data context
        return findTargetCallable(dataContext);
    }

    @Nonnull
    @Override
    public HierarchyBrowser createHierarchyBrowser(PsiElement target) {
        return new MyCallHierarchyBrowser(target);
    }

    @Override
    public void browserActivated(@Nonnull HierarchyBrowser hierarchyBrowser) {
        // Perform any setup needed when the browser is displayed
    }
}
```

## Implementation Notes

All three hierarchy provider interfaces -- `TypeHierarchyProvider`, `MethodHierarchyProvider`, and `CallHierarchyProvider` -- inherit the same three methods from `HierarchyProvider`. The only difference is the semantic contract: each interface is registered as its own extension point so the platform knows which provider to invoke for which hierarchy action.

The typical implementation pattern is:

1. In `getTarget()`, use the `DataContext` to locate the relevant PSI element (class, method, or callable) at the current caret position. Return `null` if the context is not applicable.
2. In `createHierarchyBrowser()`, construct a `HierarchyBrowser` that builds and displays the tree structure for the target element.
3. In `browserActivated()`, perform any additional initialization after the hierarchy tool window becomes visible (for example, selecting the initial view or expanding nodes).
