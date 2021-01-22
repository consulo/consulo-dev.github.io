# Migration from Consulo to Consulo

### Platform changes
 * Plugins removed from platform. They plugin ids:
    * Java > **consulo.java** (and removed his old id, **com.intellij.modules.java** )
    * Xml > **com.intellij.xml**
    * RegExp > **com.intellij.regexp**
    * Images > **com.intellij.images**
 * Added plugin named **Platform: base** have id **com.intellij**. It holder for all extensions/actions/extensionPoints for platform
 * IDEA build number **!=** Consulo build number.
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
