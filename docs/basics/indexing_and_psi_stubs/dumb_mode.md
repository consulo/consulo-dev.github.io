---
title: Dumb Mode
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

## What is Dumb Mode?

When a project is opened or significant file changes occur, Consulo updates its indexes in the background. During this indexing phase the IDE enters **dumb mode**, a state where most functionality that depends on indexes is unavailable. Only features that are explicitly marked as safe to use during indexing (by implementing `DumbAware`) remain active.

Dumb mode starts and ends inside a write action, which means that if you are inside a `ReadAction` on a background thread, dumb mode will not begin or end in the middle of your operation. However, every time you start a new top-level read action on a background thread, the dumb mode state may have changed.

## DumbService

[`DumbService`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/DumbService.java)
is a project-level service annotated with `@ServiceAPI(ComponentScope.PROJECT)` that manages the dumb mode lifecycle and provides utilities for working with it.

### Obtaining the Service

```java
DumbService dumbService = DumbService.getInstance(project);
```

### Checking Dumb Mode Status

Use `isDumb()` to check whether the project is currently in dumb mode. To avoid race conditions, call this method either on the EDT or inside a read action.

```java
if (dumbService.isDumb()) {
    // indexes are currently being updated
}
```

A static convenience method is also available:

```java
if (DumbService.isDumb(project)) {
    // ...
}
```

### Running Code When Smart Mode Returns

`runWhenSmart()` schedules a `Runnable` to execute on the EDT as soon as the project is initialized and dumb mode is over. If the project is already in smart mode, the runnable may execute immediately.

```java
DumbService.getInstance(project).runWhenSmart(() -> {
    // indexes are available here
    refreshReferences();
});
```

> **Note:** There is no guarantee that dumb mode will not start again during the execution of the runnable. Your code should handle that situation explicitly.

### Running a Read Action in Smart Mode

`runReadActionInSmartMode()` pauses the current thread until dumb mode ends, then executes the given code inside a read action where indexes are guaranteed to be available.

```java
// Runnable variant
DumbService.getInstance(project).runReadActionInSmartMode(() -> {
    PsiClass psiClass = findClass(qualifiedName);
    // work with psiClass
});

// Supplier variant -- returns a value
PsiClass result = DumbService.getInstance(project).runReadActionInSmartMode(() -> {
    return findClass(qualifiedName);
});
```

If this method is called when read access is already held, the runnable executes immediately (since waiting would cause a deadlock). In that case, an `IndexNotReadyException` may be thrown if dumb mode is active.

### Waiting for Smart Mode

`waitForSmartMode()` blocks the current thread until dumb mode ends. Prefer `runWhenSmart()` or `runReadActionInSmartMode()` over this method, because there is no guarantee that dumb mode will not begin again before your next statement executes.

```java
dumbService.waitForSmartMode();
// no guarantee that we are still in smart mode here
```

### Smart Invocation on EDT

`smartInvokeLater()` posts a `Runnable` to the EDT that will only execute when the IDE leaves dumb mode. If the project is disposed during dumb mode, the runnable is discarded.

```java
dumbService.smartInvokeLater(() -> {
    // runs on EDT when smart mode is active
    updateUI();
});

// Variant with explicit modality state
dumbService.smartInvokeLater(() -> {
    updateUI();
}, ModalityState.defaultModalityState());
```

### Filtering Extensions by Dumb-Awareness

During dumb mode, you may need to filter a list of extensions to only those that are safe to use:

```java
List<MyExtension> safeExtensions = dumbService.filterByDumbAwareness(allExtensions);
```

A static convenience method is also available:

```java
List<MyExtension> safeExtensions = DumbService.getDumbAwareExtensions(project, MY_EXTENSION_POINT);
```

### Checking if an Object is Dumb-Aware

```java
if (DumbService.isDumbAware(someObject)) {
    // safe to use during indexing
}
```

This returns `true` if the object implements `DumbAware`, or if it implements `PossiblyDumbAware` and its `isDumbAware()` method returns `true`.

## DumbAware Marker Interface

[`DumbAware`](https://github.com/consulo/consulo/blob/master/modules/base/application-api/src/main/java/consulo/application/dumb/DumbAware.java)
is a marker interface in the `consulo.application.dumb` package. Classes that implement this interface declare that they can operate safely during dumb mode -- that is, without relying on indexes.

```java
public class MyAction extends AnAction implements DumbAware {
    @Override
    public void actionPerformed(@Nonnull AnActionEvent e) {
        // this action is available even while indexes are being built
    }
}
```

Common types that can implement `DumbAware` include:

- Actions
- File editor providers
- Post-startup activities
- Completion contributors
- Annotators
- Line marker providers
- Local inspection tools
- Tool window factories

When implementing `DumbAware`, you must ensure that your code does **not** call any API that requires indexes (e.g., reference resolution, class lookup by name) unless you handle `IndexNotReadyException` explicitly.

## DumbModeTask

[`DumbModeTask`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/DumbModeTask.java)
is an abstract class for tasks that should execute **during** dumb mode. These tasks are queued via `DumbService.queueTask()` and run sequentially in the background while indexes are being built.

### Creating a DumbModeTask

Extend `DumbModeTask` and implement `performInDumbMode()`:

```java
public class MyIndexingTask extends DumbModeTask {
    @Override
    public void performInDumbMode(@Nonnull ProgressIndicator indicator, Exception trace) {
        indicator.setTextValue(LocalizeValue.localizeTODO("Updating custom index..."));
        indicator.setIndeterminate(false);

        for (int i = 0; i < items.size(); i++) {
            indicator.checkCanceled();
            indicator.setFraction((double) i / items.size());
            processItem(items.get(i));
        }
    }

    @Override
    public void dispose() {
        // clean up resources if needed
    }
}
```

### Queueing and Cancelling

Queue the task through `DumbService`:

```java
DumbService.getInstance(project).queueTask(new MyIndexingTask());
```

If needed, you can cancel a previously queued task:

```java
DumbService.getInstance(project).cancelTask(task);
```

Cancelling a running task cancels its `ProgressIndicator`, so the next `checkCanceled()` call inside `performInDumbMode()` will throw `ProcessCanceledException`.

### Task Equivalence

`DumbModeTask` supports an equivalence mechanism to prevent duplicate tasks. If several equivalent tasks are queued at once, only one will execute.

By default, equivalence is determined by object identity (`this`). You can provide a custom equivalence object through the constructor:

```java
public class MyIndexingTask extends DumbModeTask {
    public MyIndexingTask() {
        super("my-custom-index"); // equivalence key
    }

    @Override
    public void performInDumbMode(@Nonnull ProgressIndicator indicator, Exception trace) {
        // ...
    }
}
```

Two tasks are considered equivalent if their equivalence objects are equal according to `Object.equals()`.

## Listening for Dumb Mode Transitions

To react to dumb mode changes, subscribe to
[`DumbModeListener`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/event/DumbModeListener.java)
on the project message bus. This topic is annotated with `@TopicAPI(ComponentScope.PROJECT)`.

```java
project.getMessageBus().connect(disposable).subscribe(DumbModeListener.class, new DumbModeListener() {
    @Override
    public void enteredDumbMode() {
        // indexes are now being updated -- disable index-dependent features
    }

    @Override
    public void exitDumbMode() {
        // indexes are ready -- re-enable features
    }
});
```

Both callbacks are delivered on the EDT.

## Suspending Indexing

`DumbService` allows temporarily suspending indexing for heavy activities that should not compete with the indexer for CPU time:

```java
dumbService.suspendIndexingAndRun(LocalizeValue.localizeTODO("Running build"), () -> {
    // indexing is paused while this runs
    performBuild();
});
```

The user can still manually resume indexing while the activity is running.

## Alternative Resolution in Dumb Mode

In some cases (e.g., explicit Go To Declaration), it is beneficial to enable slower alternative resolve strategies that do not require indexes:

```java
dumbService.withAlternativeResolveEnabled(() -> {
    PsiReference ref = element.getReference();
    PsiElement target = ref != null ? ref.resolve() : null;
    // target may or may not be found -- IndexNotReadyException can still occur
});
```

> **Note:** Even with alternative resolution enabled, methods like `resolve()` and `findClass()` may still throw `IndexNotReadyException`. Alternative resolution improves coverage but is not a complete substitute for index-based resolution.

## Best Practices

- Implement `DumbAware` on actions and tool windows that do not need indexes, so they remain available during indexing.
- Use `runReadActionInSmartMode()` when you need guaranteed index access on a background thread.
- Use `runWhenSmart()` to schedule UI updates that depend on indexes.
- Call `checkCanceled()` frequently inside `DumbModeTask.performInDumbMode()` to allow prompt cancellation.
- Do not assume that smart mode will persist across multiple statements -- always access indexes inside a read action or use `runReadActionInSmartMode()`.
