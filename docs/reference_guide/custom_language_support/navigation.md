---
title: Navigation
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The _Go to Declaration or Usages_ action is performed in several steps.

## Direct Navigation

Direct navigation is the navigation from [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java) to another `PsiElement`,
such as navigation from `break` keyword to the end of a loop in Java, without showing any popups.

To provide `PsiElement` for direct navigation, implement
`DirectNavigationProvider` and annotate your implementation with `@ExtensionImpl`.


## Reference-Based Navigation

If there is no Direct navigation available under the caret, then the Consulo proceeds with reference-based navigation.
In this step the Consulo resolves the [`PsiReference`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiReference.java) under the caret using the `resolve()` method to find the target [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java).
If the reference resolves to multiple targets (via `PsiPolyVariantReference.multiResolve()`), then the IDE shows a navigation popup to ask the user to choose where to go.

See [References and Resolve](references_and_resolve.md) for details on implementing references.


## Showing Usages

If there are no navigation targets available, then the Consulo starts finding usages of the target element
obtained by resolving a [reference](references_and_resolve.md).
