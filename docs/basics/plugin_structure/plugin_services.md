---
title: Plugin Services
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

A _service_ is a plugin component loaded on demand when your plugin calls the `getService()` method of [`ServiceManager`](upsource:///platform/core-api/src/com/intellij/openapi/components/ServiceManager.java).

The *IntelliJ Platform* ensures that only one instance of a service is loaded even though it is called several times.

A service must have an implementation class that is used for service instantiation.
A service may also have an interface class used to obtain the service instance and provide the service's API.

A service needing a shutdown hook/cleanup routine can implement [`Disposable`](upsource:///platform/util/src/com/intellij/openapi/Disposable.java) and perform necessary work in `dispose()` (see [Automatically Disposed Objects](/basics/disposers.md#automatically-disposed-objects)).

#### Types
The *IntelliJ Platform* offers three types of services: _application level_ services (global singleton), _project level_ services, and _module level_ services.
For the latter two, a separate instance of the service is created for each instance of its corresponding scope, see [Project Model Introduction](/basics/project_structure.md).

> **NOTE** Please consider not using module-level services because it can increase memory usage for projects with many modules.

#### Constructor
Project/Module level service constructors can have a `Project`/`Module` argument.
To improve startup performance, avoid any heavy initializations in the constructor.

> **NOTE** Please note that using constructor injection is deprecated (and not supported in [Light Services](#light-services)) for performance reasons.
> Other dependencies should be [acquired only when needed](#retrieving-a-service) in all corresponding methods (see `someServiceMethod()` in [Project Service Sample](#project-service-sample)).

## Light Services

> **NOTE** Light Services are available since IntelliJ Platform 2019.3.

A service not going to be overridden does not need to be registered in `plugin.xml` (see [Declaring a Service](#declaring-a-service)).
Instead, annotate service class with [`@Service`](upsource:///platform/core-api/src/com/intellij/openapi/components/Service.java).
The service instance will be created in scope according to the caller (see [Retrieving a Service](#retrieving-a-service)).

Restrictions:

* Service class must be `final`.
* Constructor injection is not supported (since it is deprecated).
* If service is a [PersistentStateComponent](/basics/persisting_state_of_components.md), roaming must be disabled (`roamingType = RoamingType.DISABLED`).

See [Project Level Service](#project-service-sample) below for a sample.

## Declaring a Service

To register a non-[Light Service](#light-services), distinct extension points are provided for each type:

* `com.intellij.applicationService` - application level service
* `com.intellij.projectService` - project level service
* `com.intellij.moduleService` - module level service (not recommended, see Note above)
                                  
To expose service API, create separate class for `serviceInterface` and extend it in corresponding class registered in `serviceImplementation`.
If `serviceInterface` isn't specified, it's supposed to have the same value as `serviceImplementation`.

To provide custom implementation for test/headless environment, specify `testServiceImplementation`/`headlessImplementation` additionally.

_plugin.xml_

```xml
<extensions defaultExtensionNs="com.intellij">
  <!-- Declare the application level service -->
  <applicationService serviceInterface="mypackage.MyApplicationService"
                      serviceImplementation="mypackage.MyApplicationServiceImpl" />

  <!-- Declare the project level service -->
  <projectService serviceInterface="mypackage.MyProjectService"
                  serviceImplementation="mypackage.MyProjectServiceImpl" />
</extensions>
```

## Retrieving a Service

Getting service doesn't need a read action and can be performed from any thread.
If service is requested from several threads, it will be initialized in the first thread, and other threads will be blocked until service is fully initialized.

To retrieve a service in Java code:

```java
MyApplicationService applicationService = ServiceManager.getService(MyApplicationService.class);

MyProjectService projectService = project.getService(MyProjectService.class)
```

In Kotlin code, use convenience methods:

```kotlin
val applicationService = service<MyApplicationService>()

val projectService = project.service<MyProjectService>()
```

## Project Service Sample
This minimal sample shows [Light Service](#light-services) `ProjectService` interacting with another project level service `AnotherService` (not shown here).

_ProjectService.java_

```java
  @Service
  public final class ProjectService {

     private final Project myProject;

     public ProjectService(Project project) {
       myProject = project;
     }

     public void someServiceMethod(String parameter) {
       AnotherService anotherService = myProject.getService(AnotherService.class);
       String result = anotherService.anotherServiceMethod(parameter, false);
       // do some more stuff
     }
  }
```

## Sample Plugin

This sample plugin illustrates how to create and use a plugin service.
This plugin has an application service counting the number of currently opened projects in the IDE.
If this number exceeds the maximum number of simultaneously opened projects allowed by the plugin, it displays a warning message.

**To install and run the sample plugin**

* Download the included sample plugin project located [here](https://github.com/JetBrains/intellij-sdk-code-samples/tree/master/max_opened_projects).
* Start *IntelliJ IDEA*, on the starting page, click *Open Project*, and then use the *Open Project* dialog box to open the project.
* On the main menu, choose *Run \| Run* or press <kbd>Shift</kbd>+<kbd>F10</kbd>.
* If necessary, change the [Run/Debug Configurations](https://www.jetbrains.com/help/idea/run-debug-configuration-plugin.html).
