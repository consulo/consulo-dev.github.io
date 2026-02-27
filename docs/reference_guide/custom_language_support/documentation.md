---
title: Documentation
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

To provide different kinds of documentation support (quick info on hover, generated documentation, external documentation links), a plugin implements the [`DocumentationProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/documentation/DocumentationProvider.java) (`consulo.language.editor.documentation.DocumentationProvider`) interface.

There are two extension API variants for registering a documentation provider:

- [`LanguageDocumentationProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/documentation/LanguageDocumentationProvider.java) (`consulo.language.editor.documentation.LanguageDocumentationProvider`) -- annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`. This is a language-specific documentation provider that extends both `DocumentationProvider` and `LanguageExtension`. Implementations must override `getLanguage()` to specify which language the provider applies to. Multiple providers per language are supported and are composed automatically.

- [`UnrestrictedDocumentationProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/documentation/UnrestrictedDocumentationProvider.java) (`consulo.language.editor.documentation.UnrestrictedDocumentationProvider`) -- annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`. This is a language-independent documentation provider that is not restricted to a specific language.

For most custom language plugins, implement `LanguageDocumentationProvider`.

## DocumentationProvider Methods

All methods in the `DocumentationProvider` interface have default implementations that return `null`, so you only need to override the methods relevant to your language.

| Method | Description |
|--------|-------------|
| `getQuickNavigateInfo(PsiElement element, PsiElement originalElement)` | Returns the text shown in the <kbd>Ctrl</kbd>+hover popup for the specified element. The `element` parameter is the resolved target (e.g., the method a reference points to), while `originalElement` is the element under the cursor. |
| `generateDoc(PsiElement element, PsiElement originalElement)` | Returns the full HTML documentation for the element. This is the main method for generating documentation content. May be called from a background thread. Use `DocumentationMarkup` constants (`DEFINITION_START`, `DEFINITION_END`, `CONTENT_START`, `CONTENT_END`, `SECTIONS_START`, `SECTION_HEADER_START`, `SECTION_SEPARATOR`, `SECTION_END`, `SECTIONS_END`) to produce properly formatted output. |
| `generateHoverDoc(PsiElement element, PsiElement originalElement)` | Returns the HTML documentation shown on mouse hover in the editor. By default, delegates to `generateDoc()`. Override this to show a shorter version of the documentation on hover. |
| `getUrlFor(PsiElement element, PsiElement originalElement)` | Returns a list of URLs for external documentation. If the list contains a single URL, it is opened directly. If multiple URLs are returned, the user is prompted to choose. |
| `getDocumentationElementForLookupItem(PsiManager psiManager, Object object, PsiElement element)` | Returns the PSI element to show documentation for when the user requests documentation for a code completion lookup item. |
| `getDocumentationElementForLink(PsiManager psiManager, String link, PsiElement context)` | Returns the navigation target for a link in a documentation popup. The link must use the `DocumentationManagerProtocol.PSI_ELEMENT_PROTOCOL` protocol. |

## Registration

To register a language-specific documentation provider, implement `LanguageDocumentationProvider` and annotate the class with `@ExtensionImpl`:

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.language.Language;
import consulo.language.editor.documentation.LanguageDocumentationProvider;
import consulo.language.psi.PsiElement;
import consulo.language.psi.PsiManager;
import consulo.myLanguage.MyLanguage;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

@ExtensionImpl
public class MyLanguageDocumentationProvider implements LanguageDocumentationProvider {
    @Nonnull
    @Override
    public Language getLanguage() {
        return MyLanguage.INSTANCE;
    }

    @Nullable
    @Override
    public String getQuickNavigateInfo(PsiElement element, PsiElement originalElement) {
        if (element instanceof MyNamedElement namedElement) {
            return namedElement.getName() + " (" + namedElement.getContainingFile().getName() + ")";
        }
        return null;
    }

    @Nullable
    @Override
    public String generateDoc(PsiElement element, @Nullable PsiElement originalElement) {
        if (element instanceof MyNamedElement namedElement) {
            StringBuilder sb = new StringBuilder();
            sb.append(DocumentationMarkup.DEFINITION_START);
            sb.append(namedElement.getName());
            sb.append(DocumentationMarkup.DEFINITION_END);
            sb.append(DocumentationMarkup.CONTENT_START);
            sb.append("Defined in ").append(namedElement.getContainingFile().getName());
            sb.append(DocumentationMarkup.CONTENT_END);
            return sb.toString();
        }
        return null;
    }
}
```

## Related Interfaces

- [`CodeDocumentationProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/documentation/CodeDocumentationProvider.java) -- extends `DocumentationProvider` with methods for finding and generating doc comments in source code.
- [`ExternalDocumentationProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/documentation/ExternalDocumentationProvider.java) -- provides the ability to fetch external documentation and show it inline rather than in a browser.
- `DocumentationMarkup` -- constants for laying out documentation content in the documentation popup.
