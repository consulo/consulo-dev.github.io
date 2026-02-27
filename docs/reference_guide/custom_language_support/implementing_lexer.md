---
title: Implementing Lexer
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The lexer, or [lexical analyzer](https://en.wikipedia.org/wiki/Lexical_analysis), defines how a file's contents are broken into tokens.
The lexer serves as a foundation for nearly all of the features of custom language plugins, from basic syntax highlighting to advanced code analysis features.
The API for the lexer is defined by the [`Lexer`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/lexer/Lexer.java) (`consulo.language.lexer.Lexer`) interface.

The IDE invokes the lexer in three main contexts, and the plugin can provide different lexer implementations for these contexts:

*  Syntax highlighting: The lexer is returned from the implementation of the
   [`SyntaxHighlighterFactory`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/highlight/SyntaxHighlighterFactory.java) (`consulo.language.editor.highlight.SyntaxHighlighterFactory`)
   interface which is registered in the `consulo.syntaxHighlighterFactory` extension point.

*  Building the syntax tree of a file: the lexer is expected to be returned from
   [`ParserDefinition.createLexer(LanguageVersion)`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/ParserDefinition.java),
   and the
   [`ParserDefinition`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/ParserDefinition.java) (`consulo.language.parser.ParserDefinition`)
   interface is registered in the `consulo.parserDefinition` extension point.

*  Building the index of the words contained in the file:
   if the lexer-based words scanner implementation is used, the lexer is passed to the
   `DefaultWordsScanner`
   constructor.

The lexer used for syntax highlighting can be invoked incrementally to process only the file's changed part.
In contrast, lexers used in other contexts are always called to process an entire file or a complete language construction embedded in a different language file.

A lexer that can be used incrementally may need to return its *state*, which means the context corresponding to each position in a file.
For example, a Java lexer could have separate states for top-level context, comment context, and string literal context.
An essential requirement for a syntax highlighting lexer is that its state must be represented by a single integer number returned from [`Lexer.getState()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/lexer/Lexer.java).
That state will be passed to the [`Lexer.start()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/lexer/Lexer.java) method, along with the start offset of the fragment to process, when lexing is resumed from the middle of a file.
Lexers used in other contexts can always return `0` from the `getState()` method.

The easiest way to create a lexer for a custom language plugin is to use [JFlex](https://jflex.de).
Classes [`FlexLexer`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/lexer/FlexLexer.java) (`consulo.language.lexer.FlexLexer`) and [`FlexAdapter`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/lexer/FlexAdapter.java) (`consulo.language.lexer.FlexAdapter`) adapt JFlex lexers to the Consulo Lexer API.
A patched version of JFlex can be used with the lexer skeleton file located at *tools/lexer/idea-flex.skeleton* to create lexers compatible with `FlexAdapter`.
The patched version of JFlex provides a new command-line option `--charat` that changes the JFlex generated code to work with the Consulo skeleton.
Enabling `--charat` option passes the source data for lexing as a [`CharSequence`](https://docs.oracle.com/javase/8/docs/api/java/lang/CharSequence.html) and not as an array of characters.

For developing lexers using JFlex, the GrammarKit plugin can be useful.
It provides syntax highlighting and other useful features for editing JFlex files.

> **NOTE** Lexers, and in particular JFlex-based lexers, need to be created so that they always match the entire contents of the file, without any gaps between tokens, and generate special tokens for characters which are not valid at their location.
> Lexers must never abort prematurely because of an invalid character.

**Example**:
- [`Lexer`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/lexer/Lexer.java) definition for Properties language plugin
- [Custom Language Support Tutorial: Lexer](/tutorials/custom_language_support/lexer_and_parser_definition.md)

Types of tokens for lexers are defined by instances of [`IElementType`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/ast/IElementType.java) (`consulo.language.ast.IElementType`).
Many token types common for all languages are defined in the [`TokenType`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/ast/TokenType.java) (`consulo.language.ast.TokenType`) interface.
Custom language plugins should reuse these token types wherever applicable.
For all other token types, the plugin needs to create new `IElementType` instances and associate with the language in which the token type is used.
The same `IElementType` instance should be returned every time a particular token type is encountered by the lexer.

**Example:**
Token types for Properties language plugin

An important feature that can be implemented at the lexer level is mixing languages within a file, such as embedding fragments of Java code in some template language.
Suppose a language supports embedding its fragments in another language.
In that case, it needs to define the chameleon token types for different types of fragments that can be embedded, and these token types need to implement the [`ILazyParseableElementType`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/ast/ILazyParseableElementType.java) interface.
The enclosing language's lexer needs to return the entire fragment of the embedded language as a single chameleon token, of the type defined by the embedded language.
To parse the contents of the chameleon token, the IDE will call the parser of the embedded language through a call to [`ILazyParseableElementType.parseContents()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/ast/ILazyParseableElementType.java).
