---
title: SDK
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Every project uses a Software Development Kit (SDK).
For Java projects, the SDK is referred to as the JDK (Java Development Kit).
The SDK determines which API library is used to build the project.
If a project is multi-module, the project SDK by default is common for all modules within the project.
Optionally, individual SDKs for each module can be configured.

## Getting Project SDK Information
The information about the project SDK is accessed via [`ProjectRootManager`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/ProjectRootManager.java) like the following example shows

```java
Sdk projectSdk = ProjectRootManager.getInstance(project).getProjectSdk();
```

## Getting and Setting Project SDK Attributes

* To get the project level SDK

  ```java
  Sdk projectSDK = ProjectRootManager.getInstance(project).getProjectSdk();
  ```

* To get the project level SDK name:

  ```java
  String projectSDKName = ProjectRootManager.getInstance(project).getProjectSdkName();
  ```

* To set the project level SDK:

  ```java
  ProjectRootManager.getInstance(project).setProjectSdk(Sdk jdk);
  ```

* To set the project level SDK name:

  ```java
  ProjectRootManager.getInstance(project).setProjectSdkName(String name);
  ```

## Available SDKs

`SdkTable` can be used to query and modify configured SDKs.

## Working with a Custom SDK

To create a custom SDK, extend [`SdkType`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/bundle/SdkType.java) (which is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`), leave `saveAdditionalData()` blank, and annotate your subclass with `@ExtensionImpl`.

To make SDK settings persistent, override `setupSdkPaths()` and save settings by `modificator.commitChanges()`:

```java
@Override
public boolean setupSdkPaths(@NotNull Sdk sdk, @NotNull SdkModel sdkModel) {
    SdkModificator modificator = sdk.getSdkModificator();
    modificator.setVersionString(getVersionString(sdk));
    modificator.commitChanges(); // save
    return true;
}
```

The recommended way of managing SDK settings is to save settings in a [`PersistentStateComponent`](/basics/persisting_state_of_components.md).
