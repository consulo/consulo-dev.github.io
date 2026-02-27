---
title: Go to Class and Go to Symbol
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

A custom language plugin can provide its own items to be included in the lists shown when the user chooses the _Navigate | Class_ or _Navigate | Symbol_ action.
In order to do so, the plugin must provide implementations for the `ChooseByNameContributor` interface (separate implementations need to be provided for _Class_ and _Symbol_ respectively), and register them in the `consulo.gotoClassContributor` and `consulo.gotoSymbolContributor` extension points.

> **TIP** Please consider implementing `ChooseByNameContributorEx` for better performance.

Each contributor needs to be able to return a complete list of names to show in the list for a specified project, which will then be filtered by the IDE according to the text typed by the user in the dialog.
Using [File-based or Stub indices](/basics/indexing_and_psi_stubs.md) to obtain matching candidates is highly recommended to improve performance.

For each name in that list, the contributor needs to provide a list of `NavigationItem` instances (typically [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java)), which specify the destinations to jump to when a specific name is selected from the list.

**Example:**
- [Custom Language Support Tutorial: Go To Symbol Contributor](/tutorials/custom_language_support/go_to_symbol_contributor.md)
