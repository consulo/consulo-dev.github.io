---
title: Inlay Hints
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Inlay hints are small informational elements rendered inline within source code in the editor. They display extra details -- such as parameter names, type annotations, or other contextual data -- without modifying the actual document text. Consulo provides two primary approaches for contributing inlay hints: the classic `InlayParameterHintsProvider` for simple text-based parameter hints, and the `DeclarativeInlayHintsProvider` for a more structured, declarative model.

## InlayParameterHintsProvider

[`InlayParameterHintsProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/inlay/InlayParameterHintsProvider.java) is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)` and implements `LanguageExtension`. It provides simple text inlays for a given language. The order of hints that share the same offset is not guaranteed.

### Key Methods

| Method | Description |
|--------|-------------|
| `getParameterHints(PsiElement element)` | Returns a list of `InlayInfo` instances for the given element. Hint offsets must lie within the element's text range. |
| `getParameterHints(PsiElement element, PsiFile file)` | Overload that also receives the containing file. Delegates to the single-argument variant by default. |
| `getHintInfo(PsiElement element)` | Returns `HintInfo` (either `HintInfo.MethodInfo` or `HintInfo.OptionInfo`) for the element under the caret, used by intention actions to enable or disable hints. Must execute quickly (runs on the EDT). |
| `getDefaultBlackList()` | Returns the default set of patterns for which hints should not be shown. |
| `getBlackListDependencyLanguage()` | Returns a language whose exclude list is appended to this provider's list. Useful for preventing extensions (e.g., Groovy or Kotlin) from showing hints for excluded methods of a parent language. |
| `getSupportedOptions()` | Returns a list of `Option` instances shown in the settings dialog. |
| `isBlackListSupported()` | If `false`, the exclude list panel is hidden in settings. Defaults to `true`. |
| `getInlayPresentation(String inlayText)` | Customizes the visual text of a hint. By default appends `:` to the hint text. |
| `canShowHintsWhenDisabled()` | If `true`, the provider is queried for hints even when showing hints is disabled globally. |
| `isExhaustive()` | Returns `true` if the set of options is exhaustive, meaning if all options are disabled the provider collects no hints. |
| `createTraversal(PsiElement root)` | Returns a `SyntaxTraverser` for walking the subtree of the root element. |
| `getPreviewFileText()` | Returns the preview text shown in the settings page. |
| `getDescription()` | Returns a description for this provider. |

### InlayInfo

[`InlayInfo`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/inlay/InlayInfo.java) represents a single inlay hint instance. It holds:

- `text` -- the hint text to display.
- `offset` -- the document offset at which the hint appears.
- `isShowOnlyIfExistedBefore` -- when `true`, the hint is only shown if a hint already existed at this position.
- `isFilterByExcludeList` -- when `true`, the hint respects the exclude list patterns.
- `relatesToPrecedingText` -- indicates whether the hint relates to the text before the offset.
- `widthAdjustment` -- optional `HintWidthAdjustment` for fine-tuning the hint's width.

### Registration

Annotate your implementation class with `@ExtensionImpl`:

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.language.Language;
import consulo.language.editor.inlay.InlayInfo;
import consulo.language.editor.inlay.InlayParameterHintsProvider;
import consulo.language.psi.PsiElement;
import consulo.localize.LocalizeValue;
import jakarta.annotation.Nonnull;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@ExtensionImpl
public class MyInlayParameterHintsProvider implements InlayParameterHintsProvider {

    @Nonnull
    @Override
    public Language getLanguage() {
        return MyLanguage.INSTANCE;
    }

    @Nonnull
    @Override
    public List<InlayInfo> getParameterHints(@Nonnull PsiElement element) {
        // Analyze the element and return hints
        // For example, for a method call show parameter names:
        // return List.of(new InlayInfo("paramName", offset));
        return Collections.emptyList();
    }

    @Nonnull
    @Override
    public Set<String> getDefaultBlackList() {
        // Patterns for methods where hints should be suppressed
        return Set.of("java.lang.Math.*");
    }

    @Nonnull
    @Override
    public LocalizeValue getPreviewFileText() {
        return LocalizeValue.of("fun example(name: String, count: Int)");
    }
}
```

## DeclarativeInlayHintsProvider

[`DeclarativeInlayHintsProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/inlay/DeclarativeInlayHintsProvider.java) is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)` and implements `PossiblyDumbAware`. It offers a structured, declarative approach to providing inlay hints, with built-in support for grouping, options, and collector-based hint collection.

### Key Methods

| Method | Description |
|--------|-------------|
| `createCollector(PsiFile file, Editor editor)` | Creates a `DeclarativeInlayHintsCollector` for the given file and editor, or returns `null` if the provider cannot produce inlays in this context. |
| `getLanguage()` | Returns the `Language` this provider applies to. |
| `getId()` | Returns a unique string identifier for this provider. |
| `getName()` | Returns a human-readable name for the provider. |
| `getDescription()` | Returns a description of what hints this provider produces. |
| `getPreviewFileText()` | Returns sample code shown in the settings preview. |
| `getGroup()` | Returns the `InlayGroup` this provider belongs to (e.g., `PARAMETERS_GROUP`, `TYPES_GROUP`, `CODE_VISION_GROUP`). |
| `getOptions()` | Returns a set of `DeclarativeInlayOptionInfo` records describing configurable options. |
| `isEnabledByDefault()` | Returns whether this provider is enabled by default. Defaults to `true`. |

### DeclarativeInlayHintsCollector

[`DeclarativeInlayHintsCollector`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/inlay/DeclarativeInlayHintsCollector.java) is a sealed interface with two permitted variants:

- **`OwnBypassCollector`** -- collects all inlays for an entire file at once via `collectHintsForFile(PsiFile file, DeclarativeInlayTreeSink sink)`.
- **`SharedBypassCollector`** -- collects inlays per element via `collectFromElement(PsiElement element, DeclarativeInlayTreeSink sink)`.

### InlayGroup

[`InlayGroup`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/inlay/InlayGroup.java) is an enum that categorizes inlay providers for the settings UI. Available groups include `CODE_VISION_GROUP`, `PARAMETERS_GROUP`, `TYPES_GROUP`, `VALUES_GROUP`, `ANNOTATIONS_GROUP`, `METHOD_CHAINS_GROUP`, `LAMBDAS_GROUP`, `CODE_AUTHOR_GROUP`, `URL_PATH_GROUP`, and `OTHER_GROUP`.

### Registration

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.codeEditor.Editor;
import consulo.language.Language;
import consulo.language.editor.inlay.*;
import consulo.language.psi.PsiFile;
import consulo.localize.LocalizeValue;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

import java.util.Set;

@ExtensionImpl
public class MyDeclarativeInlayProvider implements DeclarativeInlayHintsProvider {

    @Nullable
    @Override
    public DeclarativeInlayHintsCollector createCollector(PsiFile file, Editor editor) {
        return new MyCollector();
    }

    @Nonnull
    @Override
    public Language getLanguage() {
        return MyLanguage.INSTANCE;
    }

    @Nonnull
    @Override
    public String getId() {
        return "my.language.type.hints";
    }

    @Nonnull
    @Override
    public LocalizeValue getName() {
        return LocalizeValue.of("Type hints");
    }

    @Nonnull
    @Override
    public LocalizeValue getDescription() {
        return LocalizeValue.of("Shows inferred types for variables");
    }

    @Nonnull
    @Override
    public LocalizeValue getPreviewFileText() {
        return LocalizeValue.of("val x = computeValue()");
    }

    @Nonnull
    @Override
    public InlayGroup getGroup() {
        return InlayGroup.TYPES_GROUP;
    }

    @Nonnull
    @Override
    public Set<DeclarativeInlayOptionInfo> getOptions() {
        return Set.of();
    }
}
```

## InlayPresentation

[`InlayPresentation`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/inlay/InlayPresentation.java) is the rendering building block for inlay views. It extends `InputHandler`, which provides mouse interaction callbacks. Presentations are created through `InlayPresentationFactory`. If you implement a custom presentation, consider extending `BasePresentation`.

### Key Methods

| Method | Description |
|--------|-------------|
| `getWidth()` | Returns the width of this presentation in pixels. |
| `getHeight()` | Returns the height of this presentation in pixels. |
| `paint(Graphics2D g, TextAttributes attributes)` | Renders the inlay. The valid drawing area is `(0, 0)` to `(width - 1, height - 1)`. |
| `fireSizeChanged(Dimension previous, Dimension current)` | Notifies listeners that the size changed, triggering a partial repaint. |
| `fireContentChanged(Rectangle area)` | Notifies listeners that content changed in the given area. |
| `addListener(PresentationListener listener)` | Registers a listener for presentation events. |
| `removeListener(PresentationListener listener)` | Unregisters a previously added listener. |
| `updateState(InlayPresentation previousPresentation)` | Called when a new presentation is collected at a position where an old one exists. Returns `true` to reuse the presentation, `false` to replace it. By default presentations are stateless and this returns `true`. |

### InputHandler (Mouse Interaction)

`InlayPresentation` extends [`InputHandler`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/inlay/InputHandler.java), which provides the following callbacks:

| Method | Description |
|--------|-------------|
| `mouseClicked(MouseEvent event, Point translated)` | Called when the user clicks on the presentation. |
| `mousePressed(MouseEvent event, Point translated)` | Called when the user presses on the presentation. |
| `mouseReleased(MouseEvent event, Point translated)` | Called when the mouse button is released. |
| `mouseMoved(MouseEvent event, Point translated)` | Called when the user moves the mouse within the inlay bounds. |
| `mouseExited()` | Called when the mouse leaves the presentation. |
| `translatePoint(Point inlayPoint)` | Translates a point from inlay coordinate space to presentation coordinate space. |
