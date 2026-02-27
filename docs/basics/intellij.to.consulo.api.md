# Migration from IntelliJ Platform to Consulo

### Java Module System (JPMS)
 * Consulo enforces **strict Java module system** (JPMS). This required two major changes:
   * **All packages have been renamed** — all JetBrains/IntelliJ packages (`com.intellij.*`, `org.jetbrains.*`) have been moved to `consulo.*` packages. You cannot simply copy IntelliJ plugin code — all imports must be updated.
   * **Code has been split into separate modules** — the monolithic IntelliJ platform codebase has been decomposed into many smaller, well-defined modules. Each module has a proper `module-info.java` with explicit `exports` and `requires` declarations.
   * Examples of package changes:
     * `com.intellij.openapi.project.Project` → `consulo.project.Project`
     * `com.intellij.openapi.editor.Editor` → `consulo.codeEditor.Editor`
     * `com.intellij.psi.PsiElement` → `consulo.language.psi.PsiElement`

### Unified UI
 * Consulo replaces the Swing-only UI with a **unified UI API** that works across multiple backends:
   * **Swing** — primary desktop implementation
   * **SWT** — alternative desktop implementation _(experimental)_
   * **Vaadin Flow** — web implementation _(experimental)_
 * Plugins should use the `consulo.ui.*` API instead of Swing directly. This allows your plugin to work on all backends.
 * Key modules:
   * [`ui-api`](https://github.com/consulo/consulo/tree/master/modules/base/ui-api) — core UI interfaces and components
   * [`ui-ex-api`](https://github.com/consulo/consulo/tree/master/modules/base/ui-ex-api) — extended UI components and utilities
 * See [Unified UI Overview](/platform/ui/overview) for more details.

### Build System & Maven
 * Consulo uses **Maven** as its build system. All platform and plugin artifacts are published to the Consulo Maven repository.
   * Maven repository: [maven.consulo.dev](https://maven.consulo.dev)
   * IntelliJ's Gradle-based `intellij-plugin` build tooling is **not supported**.
 * See [Build System](/tutorials/build_system) and [Maven Guide](/tutorials/build_system/maven_guide) for details on setting up your plugin project.

### Plugin Declaration changes
 * XML-based plugin declarations (`plugin.xml`) have been **removed**. Consulo uses **annotation-based** plugin declarations instead.
   * Extension points, extensions, actions, and other plugin components are now declared using Java annotations rather than XML configuration files.
   * See [Plugin Configuration File](/basics/plugin_structure/plugin_configuration_file) for the current annotation-based approach.

### Platform changes
 * Plugins removed from platform. They plugin ids:
    * Java > **consulo.java** (and removed his old id, **com.intellij.modules.java** )
    * Xml > **com.intellij.xml**
    * RegExp > **com.intellij.regexp**
    * Images > **com.intellij.images**
 * Added plugin named **Platform: base** have id **com.intellij**. It holder for all extensions/actions/extensionPoints for platform
 * Consulo uses its own versioning (e.g. `3-SNAPSHOT`), not IntelliJ build numbers. See [Platform Versioning](/basics/getting_started/build_number_ranges.md).
 * Now some Consulo plugins ids is not working anymore
    * **com.intellij.modules.lang** > not need to write. It will throw 'plugin not found'
    * **com.intellij.modules.platform** > not need to write. It will throw 'plugin not found'
    * **com.intellij.modules.vcs** > not need to write. It will throw 'plugin not found'
    * **com.intellij.modules.xdebugger** > not need to write. It will throw 'plugin not found'
    * **com.intellij.modules.ultimate** > obsolete (we don't have Ultimate version)
    * **com.intellij.modules.ruby** > obsolete. Use **consulo.ruby**. See [plugin repo](https://github.com/consulo-incubator/consulo-ruby)
    * **com.intellij.modules.python** > obsolete. Use **consulo.python**. See [plugin repo](https://github.com/consulo/consulo-python)
    * **com.intellij.modules.objc** > obsolete (we don't have ObjC implementation)

### API changes
 * Parsing API changes:
     * language version api.
         * `ParserDefinition#createLexer(Project)` -> `ParserDefinition#createLexer(LanguageVersion)`
         * `ParserDefinition#createParser(Project)` -> `ParserDefinition#createParser(LanguageVersion)`
         * `ParserDefinition#getWhitespaceTokens()` -> `ParserDefinition#createParser(LanguageVersion)`
         * `ParserDefinition#getCommentTokens()` -> `ParserDefinition#getCommentTokens(LanguageVersion)`
         * `ParserDefinition#getStringLiteralElements()` -> `ParserDefinition#getStringLiteralElements(LanguageVersion)`
 * Injections
     * `com.intellij.lang.injection.MultiHostInjector` changes:
         *  `getLanguagesToInject` renamed to `injectLanguages`
         * `elementsToInjectIn` removed
         * Declaration changed
         **from**
         `<multiHostInjector implementation="org.intellij.plugins.intelliLang.inject.xml.XmlLanguageInjector"/>`
         **to**
         `<multiHostInjector forClass="com.intellij.psi.xml.XmlAttributeValue" implementationClass="org.intellij.plugins.intelliLang.inject.xml.XmlLanguageInjector"/>`
         Attribute `forClass` is value of `elementsToInjectIn` method
 * Module Facets & Module Types was replaced by Module Extensions
 * JPS support was **dropped**, that why external build is not supported for now
 * `com.intellij.openapi.module.Module.getModuleFilePath` **dropped** due, Consulo **dont have module files**, all info stored in **.consulo** dir.
   Use `com.intellij.openapi.module.Module#getModuleDirPath` for it
 * .impl & .ipr files are not supported anymore. Now all module info stored in `.consulo` dir
