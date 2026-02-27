---
title: Implementing a Parser and PSI
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Parsing files in Consulo is a two-step process.
First, an abstract syntax tree (AST) is built, defining the structure of the program.
AST nodes are created internally by the IDE and are represented by instances of the [`ASTNode`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/ast/ASTNode.java) (`consulo.language.ast.ASTNode`) class.
Each AST node has an associated element type [`IElementType`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/ast/IElementType.java) (`consulo.language.ast.IElementType`) instance, and the element types are defined by the language plugin.
The AST tree's top-level node for a file needs to have a special element type, which extends the [`IFileElementType`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/ast/IFileElementType.java) (`consulo.language.ast.IFileElementType`) class.

The AST nodes have a direct mapping to text ranges in the underlying document.
The bottom-most nodes of the AST match individual tokens returned by the lexer, and higher-level nodes match multiple-token fragments.
Operations performed on nodes of the AST tree, such as inserting, removing, reordering nodes, and so on, are immediately reflected as changes to the underlying document's text.

Second, a PSI, or Program Structure Interface, tree is built on top of the AST, adding semantics and methods for manipulating specific language constructs.
Nodes of the PSI tree are represented by classes implementing the [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java) (`consulo.language.psi.PsiElement`) interface and are created by the language plugin in the [`ParserDefinition.createElement()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/ParserDefinition.java) method.
The top-level node of the PSI tree for a file needs to implement the [`PsiFile`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiFile.java) (`consulo.language.psi.PsiFile`) interface and is created in the [`ParserDefinition.createFile()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/ParserDefinition.java) method.

**Example**:
[`ParserDefinition`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/ParserDefinition.java) for Properties language plugin

The PSI's lifecycle is described in more detail in [Fundamentals](/platform/fundamentals.md).

The base classes for the PSI implementation, including `PsiFileBase`, the base implementation of [`PsiFile`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiFile.java), and `ASTWrapperPsiElement`, the base implementation of [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java), are provided by *Consulo*.

While coding parser manually is quite possible, we highly recommend generating parser and corresponding PSI classes from grammars using Grammar-Kit plugin.
Besides code generation, it provides various features for editing grammar files: syntax highlighting, quick navigation, refactorings, etc.

For re-using existing ANTLRv4 grammars, see the ANTLR4 adaptor library.

The language plugin provides the parser implementation as an implementation of the [`PsiParser`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/PsiParser.java) (`consulo.language.parser.PsiParser`) interface, returned from [`ParserDefinition.createParser(LanguageVersion)`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/ParserDefinition.java).
The parser receives an instance of the [`PsiBuilder`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/PsiBuilder.java) class, which is used to get the stream of tokens from the lexer and to hold the intermediate state of the AST being built.
The parser must process all tokens returned by the lexer up to the end of the stream, in other words, until [`PsiBuilder.getTokenType()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/PsiBuilder.java) returns `null`, even if the tokens are not valid according to the language syntax.

**Example**:
[`PsiParser`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/PsiParser.java) implementation for Properties language plugin.

The parser works by setting pairs of markers ([`PsiBuilder.Marker`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/PsiBuilder.java) instances) within the stream of tokens received from the lexer.
Each pair of markers defines the range of lexer tokens for a single node in the AST tree.
If a pair of markers is nested in another pair (starts after its start and ends before its end), it becomes the outer pair's child node.

The element type for the marker pair and for the AST node created from it is specified when the end marker is set, which is done by making the call to [`PsiBuilder.Marker.done()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/PsiBuilder.java).
Also, it is possible to drop a start marker before its end marker has been set.
The `drop()` method drops only a single start marker without affecting any markers added after it, and the `rollbackTo()` method drops the start marker and all markers added after it and reverts the lexer position to the start marker.
These methods can be used to implement lookahead when parsing.

The method [`PsiBuilder.Marker.precede()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/PsiBuilder.java) is useful for right-to-left parsing when you don't know how many markers you need at a specific position until you read more input.
For example, a binary expression `a+b+c` needs to be parsed as `( (a+b) + c )`.
Thus, two start markers are needed at the position of the token 'a', but that is not known until the token 'c' is read.
When the parser reaches the '+' token following 'b', it can call `precede()` to duplicate the start marker at 'a' position, and then put its matching end marker after 'c'.

An essential feature of [`PsiBuilder`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/PsiBuilder.java) is its handling of whitespace and comments.
The types of tokens which are treated as whitespace or comments are defined by the methods `getWhitespaceTokens()` and `getCommentTokens()` in the [`ParserDefinition`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/ParserDefinition.java) class.
[`PsiBuilder`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/PsiBuilder.java) automatically omits whitespace and comment tokens from the stream of tokens it passes to [`PsiParser`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/PsiParser.java) and adjusts the token ranges of AST nodes so that leading and trailing whitespace tokens are not included in the node.

The token set returned from [`ParserDefinition.getCommentTokens()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/ParserDefinition.java) is also used to search for TODO items.

To better understand the process of building a PSI tree for a simple expression, you can refer to the following diagram:

![PsiBuilder](img/PsiBuilder.gif)

In general, there is no single right way to implement a PSI for a custom language, and the plugin author can choose the PSI structure and set of methods that are the most convenient for the code which uses the PSI (error analysis, refactorings, and so on).
However, one base interface needs to be used by a custom language PSI implementation to support features like rename and find usages.
Every element which can be renamed or referenced (a class definition, a method definition and so on) needs to implement the [`PsiNamedElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiNamedElement.java) interface, with methods `getName()` and `setName()`.

Several functions which can be used for implementing and using the PSI can be found in the `consulo.language.psi.util` package, and in particular in the [`PsiTreeUtil`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/util/PsiTreeUtil.java) class.

> **TIP** A useful tool for debugging the PSI implementation is the PsiViewer plugin.
> It can show you the PSI structure built by your plugin, the properties of every PSI element, and highlight its text range.

Please see [Indexing and PSI Stubs](/basics/indexing_and_psi_stubs.md) for advanced topics.
