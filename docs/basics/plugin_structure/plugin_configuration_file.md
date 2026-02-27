---
title: Plugin Configuration File - plugin.xml
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The following is a sample plugin configuration file.
This sample showcases and describes all elements that can be used in the `plugin.xml` file.

Limited HTML elements are allowed within `<description>` and `<change-notes>` elements.
However, content containing HTML elements must be surrounded by `<![CDATA[  ]]>` tags.
Allowed HTML elements include text formatting, paragraphs, and lists.

```xml
<!-- `url` specifies the URL of the plugin homepage (can be opened from "Plugins" settings dialog) -->
<consulo-plugin url="https://www.company.com/my-plugin">

  <!-- Unique identifier of the plugin. It should be FQN.
       It cannot be changed between the plugin versions.
       If not specified, <name> will be used (not recommended). Required. -->
  <id>com.company.vssintegration</id>

  <!-- Plugin name. It should be short and descriptive and in Title Case.
       Displayed in the "Plugins" settings dialog and the plugin repository Web interface. Required. -->
  <name>Vss Integration</name>

  <!-- Plugin version
       Recommended format is BRANCH.BUILD.FIX (MAJOR.MINOR.FIX)
       Displayed in the "Plugins" settings dialog and the plugin repository Web interface. -->
  <version>1.0.0</version>

  <!-- The vendor of the plugin.
       The optional "url" attribute specifies the URL of the vendor homepage.
       The optional "email" attribute specifies the e-mail address of the vendor.
       Displayed in the "Plugins" settings dialog and the plugin repository Web interface. -->
  <vendor url="https://www.company.com" email="support@company.com">A Company Inc.</vendor>

  <!-- Description of the plugin.
       Should be short and to the point.
       Start the description with a verb in a present simple form such as
       "integrates", "synchronizes", "adds support for" or "lets you view".
       Don't use marketing adjectives like "simple", "lightweight", or "professional".
       Don't repeat the name of the plugin.
       For plugins that add language/platform/framework support, the description MUST specify
       the version of the corresponding language/platform/framework.
       Don't mention the IDE compatibility. E.g., don't say "Adds support to Consulo for..."
       Displayed in the "Plugins" settings dialog and the plugin repository Web interface.
       Simple HTML elements can be included between <![CDATA[  ]]> tags. -->
  <description><![CDATA[
    Integrates Volume Snapshot Service W10.
  ]]></description>

  <!-- Description of changes in the latest version of the plugin.
       Displayed in the "Plugins" settings dialog and the plugin repository Web interface.
       Simple HTML elements can be included between <![CDATA[  ]]> tags. -->
  <change-notes><![CDATA[
    Initial release of the plugin.
  ]]></change-notes>

  <!-- Mandatory dependency on another plugin.
       Include dependencies on other plugins as needed.
       See "Plugin Dependencies" for more information. -->
  <depends>com.third.party.plugin</depends>

  <!-- Optional dependency on another plugin.
       If the plugin with the "com.MySecondPlugin" ID is installed, the dependency is satisfied.
       The plugin will still load without it. -->
  <depends optional="true">com.MySecondPlugin</depends>

  <!-- Tags categorize the plugin in the repository. -->
  <tags>
    <tag>vcs</tag>
  </tags>

  <!-- Reference to localization bundle for the plugin. -->
  <localize>com.company.vssintegration.localize.VssIntegrationLocalize</localize>

  <!-- Minimum platform version required by the plugin.
       Replaces the legacy <idea-version> element. -->
  <platformVersion>3</platformVersion>

  <!-- Optional security permissions requested by the plugin. -->
  <permissions>
    <permission>INTERNET</permission>
  </permissions>

</consulo-plugin>
```

## Annotation-Based Registration

In Consulo, registration of extensions, services, actions, and listeners is done through annotations rather than XML declarations in `plugin.xml`. The XML elements `<extensions>`, `<extensionPoints>`, `<actions>`, `<application-components>`, `<project-components>`, `<module-components>`, `<applicationListeners>`, and `<projectListeners>` are no longer used.

See the following pages for details:

* [Plugin Extensions](plugin_extensions.md) for `@ExtensionImpl`
* [Plugin Extension Points](plugin_extension_points.md) for `@ExtensionAPI`
* [Plugin Services](plugin_services.md) for `@ServiceAPI` / `@ServiceImpl`
* [Plugin Listeners](plugin_listeners.md) for `@TopicAPI` / `@TopicImpl`
* [Plugin Actions](plugin_actions.md) for `@ActionImpl`
