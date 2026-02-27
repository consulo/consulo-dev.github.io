---
title: Postfix Completion
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Postfix completion allows users to transform an already-typed expression by appending a dot and a template key.
For example, typing `expr.if` can be expanded into `if (expr) {}`.
This provides a convenient way to apply common code patterns without moving the caret back to wrap existing expressions.

A custom language plugin can provide postfix completion support by implementing a [`PostfixTemplateProvider`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/postfixTemplate/PostfixTemplateProvider.java) (`consulo.language.editor.postfixTemplate.PostfixTemplateProvider`) and one or more [`PostfixTemplate`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/postfixTemplate/PostfixTemplate.java) (`consulo.language.editor.postfixTemplate.PostfixTemplate`) subclasses.

## PostfixTemplateProvider

`PostfixTemplateProvider` is an abstract class annotated with `@ExtensionAPI(ComponentScope.APPLICATION)` and implements `LanguageExtension`.
It serves as the entry point for providing postfix templates for a given language.

### Key Methods

* **`getTemplates()`** -- Returns the `Set<PostfixTemplate>` of all templates registered in this provider. This is a `final` method that delegates to `buildTemplates()` and caches the result. Duplicate keys are detected and reported as errors.

* **`buildTemplates()`** -- Abstract method that subclasses must implement. Returns the `Set<PostfixTemplate>` instances this provider offers. Called once and cached.

* **`isTerminalSymbol(char currentChar)`** -- Abstract method. Returns `true` if the given character can separate template keys. For example, the `.` (dot) character is typically a terminal symbol.

* **`preExpand(PsiFile file, Editor editor)`** -- Abstract method. Called on the EDT immediately before a template is expanded. Use this to prepare the file for expansion (for example, inserting a semicolon to simplify context checking). The file content no longer contains the template key at this point -- it is deleted before this method is invoked.

* **`afterExpand(PsiFile file, Editor editor)`** -- Abstract method. Called after the template expansion finishes, regardless of whether it succeeded. Use this to clean up any modifications made in `preExpand()`.

* **`preCheck(PsiFile copyFile, Editor realEditor, int currentOffset)`** -- Abstract method. Called to prepare a _copy_ of the file for checking template availability. Similar to `preExpand()` but operates on a copy of the file and may be invoked from any thread (EDT, read action, completion thread, etc.). The editor parameter refers to the real editor, not the copy. Use `currentOffset` rather than the editor's offset for safety.

### Retrieving Providers

You can retrieve all registered `PostfixTemplateProvider` instances for a given language using:

```java
List<PostfixTemplateProvider> providers = PostfixTemplateProvider.forLanguage(myLanguage);
```

## PostfixTemplate

[`PostfixTemplate`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/postfixTemplate/PostfixTemplate.java) is an abstract class representing a single postfix template. Each template has an ID, a presentable name, a key (the suffix the user types after the dot), an example, and an optional reference to its provider.

### Constructors

The recommended constructor is:

```java
protected PostfixTemplate(@Nullable String id,
                          @Nonnull String name,
                          @Nonnull String example,
                          @Nullable PostfixTemplateProvider provider)
```

This automatically sets the key to `"." + name`. A more explicit constructor is also available that accepts the key directly:

```java
protected PostfixTemplate(@Nullable String id,
                          @Nonnull String name,
                          @Nonnull String key,
                          @Nonnull String example,
                          @Nullable PostfixTemplateProvider provider)
```

### Key Methods

* **`isApplicable(PsiElement context, Document copyDocument, int newOffset)`** -- Abstract method. Returns `true` if this template can be applied in the given context. The `context` is the PSI element before the template key, `copyDocument` is a copy of the document containing changes from `PostfixTemplateProvider.preCheck()`, and `newOffset` is the offset before the template key.

* **`expand(PsiElement context, Editor editor)`** -- Abstract method. Performs the actual template expansion by inserting the template content into the editor.

* **`getKey()`** -- Returns the key string used for expanding the template (e.g., `".if"`, `".var"`).

* **`getId()`** -- Returns the identifier used for saving settings related to this template.

* **`getPresentableName()`** -- Returns the template name as displayed in the UI.

* **`getDescription()`** -- Returns the template description displayed in the UI. Lazily loaded.

* **`getExample()`** -- Returns a short example of the expanded form, shown in the completion popup and the templates configuration page.

* **`isEnabled(PostfixTemplateProvider provider)`** -- Returns `true` if the global postfix templates setting is enabled and this specific template is enabled in settings.

* **`isBuiltin()`** -- Returns `true` if this is a built-in template. Built-in templates cannot be removed.

* **`isEditable()`** -- Returns `true` if this template can be edited by the user.

* **`startInWriteAction()`** -- Returns `true` if the expansion should run inside a write action. Default is `true`.

* **`getProvider()`** -- Returns the `PostfixTemplateProvider` that created this template, or `null`.

`PostfixTemplate` also implements `PossiblyDumbAware`, which allows templates to declare whether they work during index updates.

## Registration

To register a postfix template provider for your custom language, extend `PostfixTemplateProvider` and annotate it with `@ExtensionImpl`.
Implement the `getLanguage()` method from `LanguageExtension` to specify which language this provider applies to.

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.codeEditor.Editor;
import consulo.language.Language;
import consulo.language.editor.postfixTemplate.PostfixTemplate;
import consulo.language.editor.postfixTemplate.PostfixTemplateProvider;
import consulo.language.psi.PsiFile;
import jakarta.annotation.Nonnull;

import java.util.HashSet;
import java.util.Set;

@ExtensionImpl
public class MyLanguagePostfixTemplateProvider extends PostfixTemplateProvider {

    @Nonnull
    @Override
    public Language getLanguage() {
        return MyLanguage.INSTANCE;
    }

    @Override
    protected Set<PostfixTemplate> buildTemplates() {
        Set<PostfixTemplate> templates = new HashSet<>();
        templates.add(new MyIfPostfixTemplate(this));
        templates.add(new MyVarPostfixTemplate(this));
        return templates;
    }

    @Override
    public boolean isTerminalSymbol(char currentChar) {
        return currentChar == '.';
    }

    @Override
    public void preExpand(@Nonnull PsiFile file, @Nonnull Editor editor) {
        // Prepare the file before expansion if needed
    }

    @Override
    public void afterExpand(@Nonnull PsiFile file, @Nonnull Editor editor) {
        // Clean up after expansion if needed
    }

    @Nonnull
    @Override
    public PsiFile preCheck(@Nonnull PsiFile copyFile, @Nonnull Editor realEditor, int currentOffset) {
        return copyFile;
    }
}
```

Then implement individual templates by extending `PostfixTemplate`:

```java
import consulo.codeEditor.Editor;
import consulo.document.Document;
import consulo.language.editor.postfixTemplate.PostfixTemplate;
import consulo.language.editor.postfixTemplate.PostfixTemplateProvider;
import consulo.language.psi.PsiElement;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

public class MyIfPostfixTemplate extends PostfixTemplate {

    public MyIfPostfixTemplate(@Nullable PostfixTemplateProvider provider) {
        super("myLang.if", "if", "if (expr) {}", provider);
    }

    @Override
    public boolean isApplicable(@Nonnull PsiElement context,
                                @Nonnull Document copyDocument,
                                int newOffset) {
        // Check if the context element is a valid expression
        return context instanceof MyExpression;
    }

    @Override
    public void expand(@Nonnull PsiElement context, @Nonnull Editor editor) {
        // Replace the expression with the if-statement wrapping it
        String exprText = context.getText();
        Document document = editor.getDocument();
        document.replaceString(
            context.getTextRange().getStartOffset(),
            context.getTextRange().getEndOffset(),
            "if (" + exprText + ") {\n\n}"
        );
    }
}
```
