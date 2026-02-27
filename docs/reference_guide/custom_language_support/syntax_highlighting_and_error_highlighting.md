---
title: Syntax Highlighting and Error Highlighting
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The class used to specify how a particular range of text should be highlighted is called [`TextAttributesKey`](https://github.com/consulo/consulo/blob/master/modules/base/color-scheme-api/src/main/java/consulo/colorScheme/TextAttributesKey.java) (`consulo.colorScheme.TextAttributesKey`).
An instance of this class is created for every distinct type of item that should be highlighted (keyword, number, string, etc.).
The `TextAttributesKey` defines the default attributes applied to items of the corresponding type (for example, keywords are bold, numbers are blue, strings are bold and green).
Highlighting from multiple `TextAttributesKey` items can be layered - for example, one key may define an item's boldness and another color.
                                                                        
## Color Settings
The mapping of the `TextAttributesKey` to specific attributes used in an editor is defined by the `EditorColorsScheme` class.
It can be configured by the user by providing an implementation of `ColorSettingPage` annotated with `@ExtensionImpl`. The base interface `ColorSettingPage` is annotated with `@ExtensionAPI`.

The _Export to HTML_ feature uses the same syntax highlighting mechanism as the editor, so it will work automatically for custom languages, which provide a syntax highlighter.

**Examples**:
- `ColorSettingsPage` for Properties language plugin
- [Custom Language Support Tutorial: Color Settings Page](/tutorials/custom_language_support/syntax_highlighter_and_color_settings_page.md)

> **NOTE** New functionality about Language Defaults and support for additional color schemes are detailed in [Color Scheme Management](/reference_guide/color_scheme_management.md).

> **TIP** To force re-highlighting, use
> `DaemonCodeAnalyzer.restart()`.

The syntax and error highlighting are performed on multiple levels: Lexer, Parser, and (External) Annotator.

## Lexer

The first syntax highlighting level is based on the lexer output and is provided through the [`SyntaxHighlighter`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/highlight/SyntaxHighlighter.java) (`consulo.language.editor.highlight.SyntaxHighlighter`) interface.
The syntax highlighter returns the `TextAttributesKey` instances for each token type, which needs special highlighting.
For highlighting lexer errors, the standard `TextAttributesKey` for bad characters `HighlighterColors.BAD_CHARACTER` can be used.

**Examples:**
- `SyntaxHighlighter` implementation for Properties language plugin
- [Custom Language Support Tutorial: Syntax Highlighter](/tutorials/custom_language_support/syntax_highlighter_and_color_settings_page.md)

## Parser

The second level of error highlighting happens during parsing.
If a particular sequence of tokens is invalid according to the grammar of the language, the [`PsiBuilder.error()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/PsiBuilder.java) method can highlight the invalid tokens and display an error message showing why they are not valid.

## Annotator

The third level of highlighting is performed through the [`Annotator`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/annotation/Annotator.java) (`consulo.language.editor.annotation.Annotator`) interface.
A plugin can provide one or more annotators annotated with `@ExtensionImpl` (the base interface `Annotator` is annotated with `@ExtensionAPI`), and these annotators are called during the background highlighting pass to process the elements in the custom language's PSI tree.

Annotators can analyze not only the syntax, but also the semantics using PSI, and thus can provide much more complex syntax and error highlighting logic.
The annotator can also provide quick fixes to problems it detects.
When the file is changed, the annotator is called incrementally to process only changed elements in the PSI tree.

> **NOTE** See also [Code Inspections](code_inspections_and_intentions.md) which offer a more fine-grained control and some additional features.

### Errors/Warning
See the Inspections topic in _Consulo UI Guidelines_ on how to write message texts for highlighting/quick fixes.

To highlight a region of text as a warning or error (2020.1 and later):
```java
    holder.newAnnotation(HighlightSeverity.WARNING, "Invalid code") // or HighlightSeverity.ERROR
        .withFix(new MyFix(psiElement))
        .create();
```

In previous versions, call `createWarningAnnotation()`/`createErrorAnnotation()` on the [`AnnotationHolder`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/annotation/AnnotationHolder.java) (`consulo.language.editor.annotation.AnnotationHolder`), and optionally calls `registerFix()` on the returned `Annotation` object to add a quick fix for the error or warning.

### Syntax
To apply additional syntax highlighting (2020.1 and later):

```java
    holder.newSilentAnnotation(HighlightSeverity.INFORMATION)
            .range(rangeToHighlight).textAttributes(MyHighlighter.EXTRA_HIGHLIGHT_ATTRIBUTE).create();
```

In previous versions, call `AnnotationHolder.createInfoAnnotation()` with an empty message and then `Annotation.setTextAttributes()`.
                                      
**Examples:**
- `Annotator` for Properties language plugin
- [Custom Language Support Tutorial: Annotator](/tutorials/custom_language_support/annotator.md)

## External Tool

Finally, if the custom language employs external tools for validating files in the language (for example, uses the Xerces library for XML schema validation), it can provide an implementation of the `ExternalAnnotator` interface annotated with `@ExtensionImpl`. The base class `ExternalAnnotator` is annotated with `@ExtensionAPI`.

The `ExternalAnnotator` highlighting has the lowest priority and is invoked only after all other background processing has completed.
It uses the same `AnnotationHolder` interface for converting the output of the external tool into editor highlighting.
                              
To skip running specific `ExternalAnnotator` for given file, annotate your `ExternalAnnotatorsFilter` implementation with `@ExtensionImpl`. The base interface `ExternalAnnotatorsFilter` is annotated with `@ExtensionAPI`.