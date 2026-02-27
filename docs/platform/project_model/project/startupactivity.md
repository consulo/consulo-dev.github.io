<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

## Preloading Activity

An activity to be executed in background on startup (regardless if some project was opened or not).

See [`consulo.application.PreloadingActivity`](https://github.com/consulo/consulo/blob/master/modules/base/application-api/src/main/java/consulo/application/internal/PreloadingActivity.java).

To register:

```xml
<extensions defaultExtensionNs="com.intellij">
  <preloadingActivity implementation="com.example.CatPreloadingActivity"/>
</extensions>
```

## Startup Activity

An activity to be executed as part of project opening, under 'Loading Project' dialog.
Can't be registered by plugins.

To register: [`StartupManager.registerStartupActivity`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/startup/StartupManager.java) or

```xml
<extensions defaultExtensionNs="com.intellij">
  <startupActivity implementation="com.example.CatStartupActivity"/>
</extensions>
```

## Post Startup Activity

An activity to be executed after project opening.

If activity implements `DumbAware`, it is executed after project is opened on a background thread with no visible progress indicator and regardless of the current indexing mode.
Otherwise, it is executed on EDT and when indexes are ready.

To register: [`StartupManager.registerPostStartupActivity`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/startup/StartupManager.java) or

```xml
<extensions defaultExtensionNs="com.intellij">
  <postStartupActivity implementation="com.example.CatStartupActivity"/>
</extensions>
```

See also `backgroundPostStartupActivity` that acts as `postStartupActivity` but is executed with 5 seconds delay after project opening.

* Use [`ProgressManager.run(Task.Backgroundable)`](https://github.com/consulo/consulo/blob/master/modules/base/application-api/src/main/java/consulo/application/progress/ProgressManager.java) to execute work that needs to be visible to users. Including work that consumes CPU over a noticeable period. Using of `Application.executeOnPooledThread` is not needed if you use the [`ProgressManager`](https://github.com/consulo/consulo/blob/master/modules/base/application-api/src/main/java/consulo/application/progress/ProgressManager.java) API.
* To execute work in the UI thread, use the application's `invokeLater` methods with a project-alive condition.
* Use `DumbService` to execute work that requires access to indices.

<!--
    todo runWhenSmart is not good method, because it implies EDT thread, but should be executed in a background thread with read action instead
-->
