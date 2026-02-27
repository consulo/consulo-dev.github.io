---
title: Publishing Plugins with Maven
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Once you have configured Maven support, you can automatically build and deploy your plugin to the [Consulo Plugin Repository](https://plugins.consulo.app).
To automatically deploy a plugin, you need to have _already published the plugin to the plugin repository at least once._
Please see the guide page for manually [publishing a plugin](../../basics/getting_started/publishing_plugin.md) for the first time.

> **TIP** Please see [Marketing](/appendix/resources/marketing.md) for remarks on how to prepare your plugin for optimal presentation.

> **WARNING** When adding additional repositories to your Maven build script, always use HTTPS protocol.

* bullet list
{:toc}

## Building Distribution
For manual distribution or local installation, invoke the Maven `package` goal to create the plugin distribution:

```
mvn package
```

The resulting artifact is located in the `target/` directory and can then be installed either manually or uploaded to a [custom plugin repository](/basics/getting_started/update_plugins_format.md).

## Providing Your Credentials to Maven
To deploy a plugin to the Consulo Plugin Repository, you need to supply your authentication credentials.

This section describes options to supply your credentials via Maven:
* Maven settings file (`settings.xml`),
* Environment variables.

### Using Maven Settings
Configure your repository credentials in your Maven `settings.xml` file (typically located at `~/.m2/settings.xml`):

```xml
<settings>
    <servers>
        <server>
            <id>consulo-plugin-repo</id>
            <username>YOUR_USERNAME</username>
            <password>YOUR_TOKEN</password>
        </server>
    </servers>
</settings>
```

### Using Environment Variables
You can also provide credentials via environment variables:

```bash
export CONSULO_PUBLISH_TOKEN='YOUR_HUB_TOKEN_HERE'
```

> **NOTE** On macOS systems, environment variables set in `.bash_profile` are only visible to processes you run from bash.
Environment variables visible to all processes need to be defined in [Environment.plist](https://developer.apple.com/library/archive/qa/qa1067/_index.html).

## Deploying a Plugin with Maven
The first step when deploying a plugin is to confirm that it works correctly.
You may wish to verify this by installing your plugin from disk on a fresh instance of your target IDE(s).

### Publishing a Plugin
Once you are confident the plugin works as intended, make sure the plugin version is updated, as the Consulo Plugin Repository won't accept multiple artifacts with the same version.

To deploy a new version of your plugin to the Consulo Plugin Repository, invoke the Maven deploy goal:

```
mvn deploy
```

Now check the most recent version of your plugin on the [Consulo Plugin Repository](https://plugins.consulo.app).
If successfully deployed, any users who currently have your plugin installed on an available version of the Consulo are notified of a new update available as soon as the update has been verified.

### Specifying a Release Channel
You may also deploy plugins to a release channel of your choosing by configuring the appropriate properties in your `pom.xml`.

When using a non-default release channel, users need to configure a new custom plugin repository in their IDE to install your plugin.
