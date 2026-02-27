---
title: Spell Checking
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Consulo provides built-in spell checking support that custom language plugins can integrate with.
By providing a [`SpellcheckingStrategy`](https://github.com/consulo/consulo/blob/master/modules/base/language-spellchecker-api/src/main/java/consulo/language/spellcheker/SpellcheckingStrategy.java) (`consulo.language.spellcheker.SpellcheckingStrategy`), a plugin controls which PSI elements in its language are subject to spell checking and how their text is tokenized for the spell checker.

## SpellcheckingStrategy

`SpellcheckingStrategy` is an abstract class annotated with `@ExtensionAPI(ComponentScope.APPLICATION)` and implements `LanguageExtension`.
It is responsible for mapping PSI elements to appropriate `Tokenizer` instances that break the element text into words for spell checking.

### Key Methods

* **`getTokenizer(PsiElement element)`** -- Returns the `Tokenizer` to use for the given PSI element.
  The default implementation provides the following behavior:
    * `PsiWhiteSpace` elements return `EMPTY_TOKENIZER` (no spell checking).
    * `PsiLanguageInjectionHost` elements with injected PSI files return `EMPTY_TOKENIZER`.
    * `PsiNameIdentifierOwner` elements return `myNameIdentifierOwnerTokenizer` (a `PsiIdentifierOwnerTokenizer` instance).
    * `PsiComment` elements return `myCommentTokenizer` (a `CommentTokenizer` instance), unless the comment is a suppression comment or a shebang line at offset 0.
    * `PsiPlainText` elements return `TEXT_TOKENIZER`.
    * All other elements return `EMPTY_TOKENIZER`.

* **`isMyContext(PsiElement element)`** -- Returns `true` if this strategy applies to the given element. The default implementation returns `true` for all elements. Override this method to limit spell checking to certain contexts within your language.

### Built-in Tokenizers

`SpellcheckingStrategy` provides several ready-to-use tokenizer instances:

| Field | Type | Description |
|-------|------|-------------|
| `EMPTY_TOKENIZER` | `Tokenizer` | A no-op tokenizer that produces no tokens. Use this to skip spell checking for an element. |
| `TEXT_TOKENIZER` | `Tokenizer<PsiElement>` | A `TokenizerBase` using `PlainTextTokenSplitter`. Suitable for plain text content. |
| `myCommentTokenizer` | `Tokenizer<PsiComment>` | A `CommentTokenizer` that feeds comment text through `CommentTokenSplitter`. |
| `myNameIdentifierOwnerTokenizer` | `Tokenizer<PsiNameIdentifierOwner>` | A `PsiIdentifierOwnerTokenizer` that extracts the name identifier and feeds it through `IdentifierTokenSplitter`. |

### The Tokenizer Class

The [`Tokenizer<T>`](https://github.com/consulo/consulo/blob/master/modules/base/language-spellchecker-api/src/main/java/consulo/language/spellcheker/tokenizer/Tokenizer.java) (`consulo.language.spellcheker.tokenizer.Tokenizer`) abstract class defines how a PSI element's text is broken into tokens for spell checking:

* **`tokenize(T element, TokenConsumer consumer)`** -- Breaks the element text into tokens and passes them to the `TokenConsumer`. Annotated with `@RequiredReadAction`.
* **`getHighlightingRange(PsiElement element, int offset, TextRange textRange)`** -- Returns the text range to highlight when a misspelling is found.

The [`TokenConsumer`](https://github.com/consulo/consulo/blob/master/modules/base/language-spellchecker-api/src/main/java/consulo/language/spellcheker/tokenizer/TokenConsumer.java) (`consulo.language.spellcheker.tokenizer.TokenConsumer`) abstract class receives tokens from the tokenizer:

* **`consumeToken(PsiElement element, TokenSplitter tokenSplitter)`** -- Consumes a token using the given splitter.
* **`consumeToken(PsiElement element, boolean useRename, TokenSplitter tokenSplitter)`** -- Consumes a token with an option to use rename-based correction.
* **`consumeToken(PsiElement element, String text, boolean useRename, int offset, TextRange rangeToCheck, TokenSplitter tokenSplitter)`** -- The most detailed variant, specifying exact text, offset, and range.

### Retrieving Strategies

You can retrieve all registered `SpellcheckingStrategy` instances for a given language using the static method:

```java
List<SpellcheckingStrategy> strategies = SpellcheckingStrategy.forLanguage(myLanguage);
```

## Registration

To register a spell checking strategy for your custom language, create a class that extends `SpellcheckingStrategy` and annotate it with `@ExtensionImpl`.
Implement the `getLanguage()` method from `LanguageExtension` to indicate which language this strategy applies to.

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.language.Language;
import consulo.language.psi.PsiElement;
import consulo.language.spellcheker.SpellcheckingStrategy;
import consulo.language.spellcheker.tokenizer.Tokenizer;
import jakarta.annotation.Nonnull;

@ExtensionImpl
public class MyLanguageSpellcheckingStrategy extends SpellcheckingStrategy {

    @Nonnull
    @Override
    public Language getLanguage() {
        return MyLanguage.INSTANCE;
    }

    @Nonnull
    @Override
    public Tokenizer getTokenizer(PsiElement element) {
        if (element instanceof MyStringLiteralElement) {
            return TEXT_TOKENIZER;
        }
        return super.getTokenizer(element);
    }

    @Override
    public boolean isMyContext(@Nonnull PsiElement element) {
        return true;
    }
}
```

In this example, the strategy adds spell checking for string literal elements (using `TEXT_TOKENIZER`) while falling back to the default behavior for all other element types.
Comments and named identifiers are already handled by the default `getTokenizer()` implementation.

## Custom Tokenizers

If the built-in tokenizers do not meet your needs, you can create a custom `Tokenizer` implementation:

```java
import consulo.annotation.access.RequiredReadAction;
import consulo.language.psi.PsiElement;
import consulo.language.spellcheker.tokenizer.TokenConsumer;
import consulo.language.spellcheker.tokenizer.Tokenizer;
import consulo.language.spellcheker.tokenizer.splitter.PlainTextTokenSplitter;
import jakarta.annotation.Nonnull;

public class MyCustomTokenizer extends Tokenizer<PsiElement> {
    @Override
    @RequiredReadAction
    public void tokenize(@Nonnull PsiElement element, TokenConsumer consumer) {
        String text = element.getText();
        // Strip surrounding quotes before spell checking
        if (text.length() > 2) {
            consumer.consumeToken(element, text.substring(1, text.length() - 1),
                false, 1,
                new TextRange(0, text.length() - 2),
                PlainTextTokenSplitter.getInstance());
        }
    }
}
```

Then return your custom tokenizer from `getTokenizer()` for the appropriate element types.
