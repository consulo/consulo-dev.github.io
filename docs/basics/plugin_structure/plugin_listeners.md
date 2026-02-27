---
title: Plugin Listeners
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

::: info
Listener implementations must be stateless and may not implement life-cycle (e.g., `Disposable`).
:::


_Listeners_ allow plugins to declaratively subscribe to events delivered through the message bus (see [Messaging infrastructure](/reference_guide/messaging_infrastructure.md) for details).

You can define both application- and project-level listeners.

Listeners are registered via the `@TopicImpl` annotation on the implementation class.
The platform-side listener interface is annotated with `@TopicAPI`, which defines the topic and its scope.
This declarative registration allows for better performance because listener instances get created lazily -- the first time an event is sent to the topic -- and not during application startup or project opening.

## Defining Application-Level Listeners

The platform defines listener interfaces annotated with `@TopicAPI`.
To subscribe to a topic, annotate your implementation class with `@TopicImpl` specifying the appropriate scope.

As a specific example, if you want to receive events about all virtual file system changes, you need to implement the [`BulkFileListener`](https://github.com/consulo/consulo/blob/master/modules/base/virtual-file-system-api/src/main/java/consulo/virtualFileSystem/fileEvent/BulkFileListener.java) interface.
The platform already defines this interface with `@TopicAPI`:

```java
// Platform defines the topic (already done):
@TopicAPI(ComponentScope.APPLICATION)
public interface BulkFileListener { ... }
```

Your plugin implements it and annotates the class with `@TopicImpl`:

```java
@TopicImpl(ComponentScope.APPLICATION)
public class MyVfsListener implements BulkFileListener {
    @Override
    public void after(@Nonnull List<? extends VFileEvent> events) {
        // handle the events
    }
}
```

Both `@TopicAPI` and `@TopicImpl` carry the scope (`ComponentScope.APPLICATION` or `ComponentScope.PROJECT`).

`@TopicAPI` also has a `direction` parameter that controls message broadcast behavior:

* `TopicBroadcastDirection.TO_CHILDREN` (default) - messages are broadcast from parent to children
* `TopicBroadcastDirection.TO_PARENT` - messages are broadcast from children to parent
* `TopicBroadcastDirection.NONE` - no broadcast, messages stay within the same scope

## Defining Project-Level Listeners

Project-level listeners are registered in the same way, using `ComponentScope.PROJECT`.
They can be used to listen to project-level events, for example, tool window operations:

```java
@TopicImpl(ComponentScope.PROJECT)
public class MyToolwindowListener implements ToolWindowManagerListener {
    private final Project project;

    @Inject
    public MyToolwindowListener(Project project) {
        this.project = project;
    }

    @Override
    public void stateChanged() {
        // handle the state change
    }
}
```

Use `@Inject` on the constructor to receive the `Project` instance for project-level listeners.

## Additional Attributes

The `@TopicImpl` annotation supports a `profiles` parameter to control conditional loading of listeners.
This replaces the previous `activeInTestMode` and `activeInHeadlessMode` XML attributes.

The `profiles` parameter allows you to specify under which runtime profiles the listener should be active, giving you fine-grained control over when your listener is loaded.
