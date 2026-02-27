---
title: Parameter Info
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Parameter info is the popup that appears when the caret is inside a function or method call, showing the names and types of the expected parameters. It helps developers see which arguments a function expects and highlights the parameter corresponding to the current caret position. In Consulo, this feature is provided by implementing the `ParameterInfoHandler` interface.

## ParameterInfoHandler

[`ParameterInfoHandler<ParameterOwner, ParameterType>`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/parameterInfo/ParameterInfoHandler.java) is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)` and implements `LanguageExtension`. It is a generic interface where:

- `ParameterOwner` is the PSI element type that owns parameters (e.g., a method call expression).
- `ParameterType` is the type representing an individual parameter or parameter list (e.g., a method declaration or overload candidate).

Multiple handlers can be registered for the same language (it uses a one-to-many language extension pattern).

### Key Methods

| Method | Description |
|--------|-------------|
| `couldShowInLookup()` | Returns whether parameter info can appear inside the code completion lookup. |
| `getParametersForLookup(LookupElement item, ParameterInfoContext context)` | Returns the parameter objects to show when a lookup item is selected. |
| `findElementForParameterInfo(CreateParameterInfoContext context)` | Locates the `ParameterOwner` element at the caret position. Should also call `context.setItemsToShow(...)` to set the candidates to display, and may set the highlighted element. Executed on a background thread. |
| `showParameterInfo(ParameterOwner element, CreateParameterInfoContext context)` | Displays the parameter info popup. Typically calls `context.showHint(...)`. |
| `findElementForUpdatingParameterInfo(UpdateParameterInfoContext context)` | Locates the `ParameterOwner` when the caret moves within the call. Returns `null` to dismiss the popup. Executed on a background thread. |
| `processFoundElementForUpdatingParameterInfo(ParameterOwner parameterOwner, UpdateParameterInfoContext context)` | Performs extra UI-thread work after `findElementForUpdatingParameterInfo` returns. |
| `updateParameterInfo(ParameterOwner parameterOwner, UpdateParameterInfoContext context)` | Updates the parameter info context when the caret position changes. Can update the context and the state of `context.getObjectsToView()`. Executed on a background thread. |
| `updateUI(ParameterType p, ParameterInfoUIContext context)` | Updates the visual presentation for a single parameter candidate. Executed on the UI thread. Use `context.setupUIComponentPresentation(...)` or `context.setUIComponentEnabled(...)` here. Do not perform heavy calculations in this method. |
| `supportsOverloadSwitching()` | Returns whether the user can cycle through overloaded variants. Defaults to `false`. |
| `dispose(DeleteParameterInfoContext context)` | Called when the parameter info popup is dismissed. |
| `isWhitespaceSensitive()` | Returns whether whitespace is significant for parameter tracking. Defaults to `false`. |
| `syncUpdateOnCaretMove(UpdateParameterInfoContext context)` | Performs synchronous updates when the caret moves. |

### Threading Model

Several methods in this interface run on a background thread rather than the EDT:

- `findElementForParameterInfo` -- background thread
- `findElementForUpdatingParameterInfo` -- background thread
- `updateParameterInfo` -- background thread
- `updateUI` -- UI thread only

Keep heavy computation (such as resolve operations) in the background-thread methods. The `updateUI` method should only update the visual representation.

### Registration

Annotate your implementation class with `@ExtensionImpl`:

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.language.Language;
import consulo.language.editor.completion.lookup.LookupElement;
import consulo.language.editor.parameterInfo.*;
import consulo.language.psi.PsiElement;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

@ExtensionImpl
public class MyParameterInfoHandler
        implements ParameterInfoHandler<MyCallExpression, MyFunctionDeclaration> {

    @Nonnull
    @Override
    public Language getLanguage() {
        return MyLanguage.INSTANCE;
    }

    @Override
    public boolean couldShowInLookup() {
        return true;
    }

    @Nullable
    @Override
    public Object[] getParametersForLookup(LookupElement item, ParameterInfoContext context) {
        return null;
    }

    @Nullable
    @Override
    public MyCallExpression findElementForParameterInfo(
            @Nonnull CreateParameterInfoContext context) {
        // Find the call expression at the caret offset
        PsiElement element = context.getFile()
                .findElementAt(context.getOffset());
        // Walk up to the call expression
        MyCallExpression call = findEnclosingCall(element);
        if (call != null) {
            // Set candidates to display
            context.setItemsToShow(resolveOverloads(call));
        }
        return call;
    }

    @Override
    public void showParameterInfo(@Nonnull MyCallExpression element,
                                  @Nonnull CreateParameterInfoContext context) {
        context.showHint(element, element.getTextRange().getStartOffset(), this);
    }

    @Nullable
    @Override
    public MyCallExpression findElementForUpdatingParameterInfo(
            @Nonnull UpdateParameterInfoContext context) {
        PsiElement element = context.getFile()
                .findElementAt(context.getOffset());
        return findEnclosingCall(element);
    }

    @Override
    public void updateParameterInfo(@Nonnull MyCallExpression parameterOwner,
                                    @Nonnull UpdateParameterInfoContext context) {
        // Update the current parameter index based on caret position
        context.setCurrentParameter(
                calculateParameterIndex(parameterOwner, context.getOffset()));
    }

    @Override
    public void updateUI(MyFunctionDeclaration p,
                         @Nonnull ParameterInfoUIContext context) {
        // Build the display string and highlight the current parameter
        String text = buildParameterListText(p);
        int highlightStart = getHighlightStart(p, context.getCurrentParameterIndex());
        int highlightEnd = getHighlightEnd(p, context.getCurrentParameterIndex());
        context.setupUIComponentPresentation(
                text, highlightStart, highlightEnd,
                false, false, false, context.getDefaultParameterColor());
    }

    // ... helper methods omitted for brevity
}
```
