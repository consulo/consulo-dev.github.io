---
title: 11. Find Usages Provider
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

A `FindUsagesProvider` uses a word scanner to build an index of words in every file.
A scanner breaks the text into words and defines the context for each word.

**Reference**: [Find Usages](/reference_guide/custom_language_support/find_usages.md)

* bullet list
{:toc}

## 11.1. Define a Find Usages Provider
The `SimpleFindUsagesProvider` implements [`FindUsagesProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/findUsage/FindUsagesProvider.java).
Using the `DefaultWordsScanner` ensures the scanner implementation is thread-safe.
See the comments in `FindUsagesProvider` for more information.

```java
package org.consulo.sdk.language;

import consulo.annotation.component.ExtensionImpl;
import consulo.language.Language;
import consulo.language.ast.TokenSet;
import consulo.language.cacheBuilder.DefaultWordsScanner;
import consulo.language.cacheBuilder.WordsScanner;
import consulo.language.findUsage.FindUsagesProvider;
import consulo.language.psi.PsiElement;
import consulo.language.psi.PsiNamedElement;
import org.consulo.sdk.language.psi.SimpleProperty;
import org.consulo.sdk.language.psi.SimpleTokenSets;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

@ExtensionImpl
final class SimpleFindUsagesProvider implements FindUsagesProvider {

  @Nonnull
  @Override
  public Language getLanguage() {
    return SimpleLanguage.INSTANCE;
  }

  @Override
  public WordsScanner getWordsScanner() {
    return new DefaultWordsScanner(new SimpleLexerAdapter(),
        SimpleTokenSets.IDENTIFIERS,
        SimpleTokenSets.COMMENTS,
        TokenSet.EMPTY);
  }

  @Override
  public boolean canFindUsagesFor(@Nonnull PsiElement psiElement) {
    return psiElement instanceof PsiNamedElement;
  }

  @Nullable
  @Override
  public String getHelpId(@Nonnull PsiElement psiElement) {
    return null;
  }

  @Nonnull
  @Override
  public String getType(@Nonnull PsiElement element) {
    if (element instanceof SimpleProperty) {
      return "simple property";
    }
    return "";
  }

  @Nonnull
  @Override
  public String getDescriptiveName(@Nonnull PsiElement element) {
    if (element instanceof SimpleProperty) {
      return ((SimpleProperty) element).getKey();
    }
    return "";
  }

  @Nonnull
  @Override
  public String getNodeText(@Nonnull PsiElement element, boolean useFullName) {
    if (element instanceof SimpleProperty) {
      return ((SimpleProperty) element).getKey() +
          SimpleAnnotator.SIMPLE_SEPARATOR_STR +
          ((SimpleProperty) element).getValue();
    }
    return "";
  }

}
```

## 11.2. Register the Find Usages Provider
The [`FindUsagesProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/findUsage/FindUsagesProvider.java) interface is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`. To register the find usages provider with the Consulo, annotate the `SimpleFindUsagesProvider` implementation class with `@ExtensionImpl`.

## 11.3. Run the Project
Rebuild the project, and run `simple_language_plugin` in a Development Instance.
The IDE now supports Find Usages for any property with a reference:

![Find Usages](img/find_usages.png)
