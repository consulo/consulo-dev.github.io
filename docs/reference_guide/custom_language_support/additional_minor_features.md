---
title: Additional Minor Features
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

A number of minor features are listed in the following format:

_Annotate your implementation with `@ExtensionImpl`._ - Registration approach for the extension point

_`com.extensionPoint.class`_ _description text_ - Extension Point class/interface to provide functionality

_- Sample 1_ - Sample implementation


### Brace Matching
Annotate your implementation with `@ExtensionImpl`.

`PairedBraceMatcher`
Returns an array of brace pairs (`BracePair`) specifying the characters for the opening and closing braces and the lexer token types for these characters.
(In principle, it is possible to return multi-character tokens, like "begin" and "end", as the start and end tokens of a brace pair.
The IDE will match such braces, but the highlighting for such braces will not be entirely correct.)

Certain types of braces can be marked as structural.
Structural braces have higher priority than regular braces: they are matched with each other even if there are unmatched braces of different types between them.
An opening non-structural brace is not matched with a closing one if one of them is inside a pair of matched structural braces and another is outside.


### Comment Code
Annotate your implementation with `@ExtensionImpl`.

[`Commenter`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/Commenter.java) (`consulo.language.Commenter`) returns the prefix for the line comment, and the prefix and suffix for the block comment if supported by the language.

- `Commenter` for Properties language plugin
- [Custom Language Support Tutorial: Commenter](/tutorials/custom_language_support/commenter.md)


### Code Folding
Annotate your implementation with `@ExtensionImpl`.

[`FoldingBuilder`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/folding/FoldingBuilder.java) (`consulo.language.editor.folding.FoldingBuilder`) returns the list of foldable text ranges (as an array of [`FoldingDescriptor`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/folding/FoldingDescriptor.java) (`consulo.language.editor.folding.FoldingDescriptor`) objects), the replacement text which is shown for each range when it is folded, and the default state of each folding region (folded or unfolded).

- [Custom Language Support Tutorial: Folding Builder](/tutorials/custom_language_support/folding_builder.md)


### Join Lines
Annotate your implementation with `@ExtensionImpl`.

`JoinLinesHandlerDelegate` allows extending support smart/semantic *Edit \| Join Lines* (e.g., String literal split on multiple lines).


### Smart Enter
Annotate your implementation with `@ExtensionImpl`.

`SmartEnterProcessor` handles *Edit \| Complete Statement* (e.g., autocomplete missing semicolon/parentheses).


### Naming Suggestions
Annotate your implementation with `@ExtensionImpl`.

`NameSuggestionProvider` provides name suggestions for the given element, e.g., for Rename refactoring.


### Semantic Highlight Usages
Annotate your implementation with `@ExtensionImpl`.

`HighlightUsagesHandlerFactory` allows highlighting e.g., Exit Points or Exceptions.

### Parameter Info
Annotate your implementation with `@ExtensionImpl`.

`ParameterInfoHandler` provides support for *View \| Parameter Info*.


### To Do View
EP: n/a

[`ParserDefinition.getCommentTokens()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/parser/ParserDefinition.java) must return the set of tokens treated as comments to populate *To Do View*.


### Context Info
Annotate your implementation with `@ExtensionImpl`.

`DeclarationRangeHandler` provides *View \| Context Info* for custom languages with structure view implementation based on a [`TreeBasedStructureViewBuilder`](https://github.com/consulo/consulo/blob/master/modules/base/file-editor-api/src/main/java/consulo/fileEditor/structureView/TreeBasedStructureViewBuilder.java) (`consulo.fileEditor.structureView.TreeBasedStructureViewBuilder`).


### Spellchecking
Annotate your implementation with `@ExtensionImpl`.

`SpellcheckingStrategy` provides `Tokenizer` to use for given [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java) (return `EMPTY_TOKENIZER` for no spellchecking).

### Reference Injection
Annotate your implementation with `@ExtensionImpl`.

`ReferenceInjector` allows users to inject pre-defined references (e.g., "Encoding", "File Reference") into `PsiLanguageInjectionHost` elements (Language Injection plugin required).


### Color Preview/Chooser
Annotate your implementation with `@ExtensionImpl`.

`ElementColorProvider` renders gutter icon for element containing color information.
