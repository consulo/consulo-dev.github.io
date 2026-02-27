---
title: Documentation
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

To provide different kinds of documentation support, the plugin needs to provide an implementation of the [`DocumentationProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/documentation/DocumentationProvider.java) (`consulo.language.editor.documentation.DocumentationProvider`) interface and register it in the `consulo.documentationProvider` extension point.
A standard base class for such implementations is available in `AbstractDocumentationProvider`.

The `getQuickNavigateInfo()` method returns the text to be displayed when the user holds the mouse over an element with <kbd>Ctrl</kbd> pressed.

When generating complete documentation via `generateDoc()`, use `DocumentationMarkup` to layout contents (see JavaDoc for details).

Additional custom actions can be added to documentation inlays and documentation popup via `consulo.codeInsight.documentation.DocumentationActionProvider` registered in `consulo.documentationActionProvider` extension point. (2020.3)

**Example**:
`DocumentationProvider` for Properties language plugin
