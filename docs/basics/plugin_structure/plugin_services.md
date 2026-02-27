---
title: Plugin Services
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

A _service_ is a plugin component loaded on demand when your plugin first requests it.

The *Consulo* ensures that only one instance of a service is loaded even though it is called several times.
Services are registered via annotations (`@ServiceAPI` and `@ServiceImpl`) rather than XML.

A service must have an implementation class that is used for service instantiation.
A service may also have an interface class used to obtain the service instance and provide the service's API.

To obtain a service instance, use `Application.get().getInstance(MyService.class)` for application-level services, or `project.getInstance(MyService.class)` for project-level services.
You can also use constructor injection with `@Inject`.

A service needing a shutdown hook/cleanup routine can implement [`Disposable`](https://github.com/consulo/consulo/blob/master/modules/base/disposer-api/src/main/java/consulo/disposer/Disposable.java) and perform necessary work in `dispose()` (see [Automatically Disposed Objects](/basics/disposers.md#automatically-disposed-objects)).

#### Types
The *Consulo* offers three types of services: _application level_ services (global singleton), _project level_ services, and _module level_ services.
For the latter two, a separate instance of the service is created for each instance of its corresponding scope, see [Project Model Introduction](/basics/project_structure.md).

> **NOTE** Please consider not using module-level services because it can increase memory usage for projects with many modules.

#### Constructor
Consulo uses `@Inject` for constructor injection in services.
Project/Module level service constructors can receive a [`Project`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/Project.java)/[`Module`](https://github.com/consulo/consulo/blob/master/modules/base/module-api/src/main/java/consulo/module/Module.java) argument via `@Inject`.
To improve startup performance, avoid any heavy initializations in the constructor.

> **NOTE** Other dependencies should be [acquired only when needed](#retrieving-a-service) in all corresponding methods (see `someServiceMethod()` in [Project Service Sample](#project-service-sample)).

## Declaring a Service

Services are declared using the `@ServiceAPI` and `@ServiceImpl` annotations.

`@ServiceAPI` is placed on the service interface (or class, if there is no separate interface) and requires a `ComponentScope` parameter to specify the service level:

* `ComponentScope.APPLICATION` - application level service
* `ComponentScope.PROJECT` - project level service
* `ComponentScope.MODULE` - module level service (not recommended, see Note above)

`@ServiceImpl` is placed on the implementation class.

### Application-Level Service Example

```java
@ServiceAPI(ComponentScope.APPLICATION)
public interface MyService {
    static MyService getInstance() {
        return Application.get().getInstance(MyService.class);
    }

    void doSomething();
}

@ServiceImpl
public class MyServiceImpl implements MyService {
    @Override
    public void doSomething() { /* ... */ }
}
```

### Project-Level Service Example

```java
@ServiceAPI(ComponentScope.PROJECT)
public interface MyProjectService {
    void doSomething();
}

@ServiceImpl
public class MyProjectServiceImpl implements MyProjectService {
    private final Project myProject;

    @Inject
    public MyProjectServiceImpl(Project project) {
        myProject = project;
    }

    @Override
    public void doSomething() { /* ... */ }
}
```

## Retrieving a Service

Getting a service does not need a read action and can be performed from any thread.
If a service is requested from several threads, it will be initialized in the first thread, and other threads will be blocked until the service is fully initialized.

For application-level services:

```java
MyService service = Application.get().getInstance(MyService.class);
```

For project-level services:

```java
MyProjectService service = project.getInstance(MyProjectService.class);
```

You can also define a static convenience method on the service interface itself (as shown in the application-level example above).

## Project Service Sample

This sample shows a `ProjectService` interacting with another project level service `AnotherService` (not shown here).

_ProjectService.java_

```java
@ServiceAPI(ComponentScope.PROJECT)
public interface ProjectService {

    void someServiceMethod(String parameter);
}
```

_ProjectServiceImpl.java_

```java
@ServiceImpl
public class ProjectServiceImpl implements ProjectService {

    private final Project myProject;

    @Inject
    public ProjectServiceImpl(Project project) {
        myProject = project;
    }

    @Override
    public void someServiceMethod(String parameter) {
        AnotherService anotherService = myProject.getInstance(AnotherService.class);
        String result = anotherService.anotherServiceMethod(parameter, false);
        // do some more stuff
    }
}
```
