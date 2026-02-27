---
title: Background Tasks
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

## Overview

Long-running operations in Consulo should never block the UI thread. The platform provides the
[`ProgressManager`](https://github.com/consulo/consulo/blob/master/modules/base/application-api/src/main/java/consulo/application/progress/ProgressManager.java)
service and the
[`Task`](https://github.com/consulo/consulo/blob/master/modules/base/application-api/src/main/java/consulo/application/progress/Task.java)
class hierarchy to run work in background threads while displaying progress to the user.

## ProgressManager

`ProgressManager` is an application-level service annotated with `@ServiceAPI(ComponentScope.APPLICATION)`. Obtain an instance with the static factory method:

```java
ProgressManager progressManager = ProgressManager.getInstance();
```

### Running a Task

The preferred way to execute a long-running operation is to create a `Task` subclass and pass it to `run()`:

```java
ProgressManager.getInstance().run(task);
```

`run()` accepts either a `Task.Modal` or a `Task.Backgroundable` instance (see sections below).

### Running a Process with a Synchronous Modal Dialog

`runProcessWithProgressSynchronously()` executes an operation in a background thread while showing a **modal** progress dialog. If a dialog cannot be shown (e.g. under a write action or in a headless environment), the operation runs synchronously in the calling thread.

```java
boolean success = ProgressManager.getInstance().runProcessWithProgressSynchronously(
    () -> {
        // long-running work
        ProgressManager.checkCanceled();
    },
    LocalizeValue.localizeTODO("Processing items..."),
    true,   // canBeCanceled
    project
);
```

The method returns `true` if the operation completed successfully, or `false` if the user cancelled it.

A variant that returns a computed value is also available:

```java
String result = ProgressManager.getInstance().runProcessWithProgressSynchronously(
    () -> {
        // compute and return a value
        return computeExpensiveResult();
    },
    LocalizeValue.localizeTODO("Computing..."),
    true,
    project
);
```

### Running a Process with an Existing ProgressIndicator

To associate a `Runnable` with a specific `ProgressIndicator` on the calling thread, use `runProcess()`:

```java
ProgressManager.getInstance().runProcess(() -> {
    // work goes here; ProgressManager.getProgressIndicator() returns 'indicator'
}, indicator);
```

Inside the runnable, `ProgressManager.getProgressIndicator()` will return the supplied indicator, and `ProgressManager.checkCanceled()` will throw `ProcessCanceledException` if that indicator is cancelled.

### Checking for Cancellation

Call the static `checkCanceled()` frequently inside long-running operations so that the platform can interrupt them promptly when the user presses Cancel:

```java
ProgressManager.checkCanceled();
```

This throws `ProcessCanceledException` if the current thread's progress indicator has been cancelled. You should **not** catch this exception yourself -- let it propagate so the platform handles it.

### Non-Cancellable Sections

If part of your operation must not be interrupted, wrap it with `executeNonCancelableSection()`:

```java
ProgressManager.getInstance().executeNonCancelableSection(() -> {
    // this block will not be interrupted by checkCanceled()
});
```

## Task Classes

The abstract `Task` class implements the `Progressive` interface, which requires a single method:

```java
void run(@Nonnull ProgressIndicator indicator);
```

`Task` provides two main concrete subclasses: `Task.Backgroundable` and `Task.Modal`.

### Task.Backgroundable

A backgroundable task runs in a background thread and displays progress in the status bar. The user can optionally send it to the background by pressing a button in the progress dialog.

**Creating a backgroundable task by subclassing:**

```java
new Task.Backgroundable(project, LocalizeValue.localizeTODO("Synchronizing data"), true) {
    @Override
    public void run(@Nonnull ProgressIndicator indicator) {
        indicator.setTextValue(LocalizeValue.localizeTODO("Loading changes..."));
        indicator.setFraction(0.0);
        // perform work...
        indicator.setFraction(1.0);
    }

    @Override
    public void onSuccess() {
        // called on the UI thread after run() completes normally
    }

    @Override
    public void onCancel() {
        // called on the UI thread if the task was cancelled
    }

    @Override
    public void onThrowable(@Nonnull Throwable throwable) {
        // called on the UI thread if run() threw an exception
    }

    @Override
    public void onFinished() {
        // always called on the UI thread after the task completes (success, cancel, or error)
    }
}.queue();
```

The constructor parameters are:
- `project` -- the project context (may be `null`)
- `title` -- a `LocalizeValue` displayed in the progress UI
- `canBeCancelled` -- whether the Cancel button is shown

Calling `queue()` on the task is equivalent to calling `ProgressManager.getInstance().run(this)`.

**Using the static helper method:**

For simpler cases where you do not need lifecycle callbacks beyond the work itself, use the static `queue()` method:

```java
Task.Backgroundable.queue(project, LocalizeValue.localizeTODO("Downloading files"), true, indicator -> {
    indicator.setIndeterminate(false);
    for (int i = 0; i < files.size(); i++) {
        indicator.checkCanceled();
        indicator.setFraction((double) i / files.size());
        downloadFile(files.get(i));
    }
});
```

A variant with an `onSuccess` callback is also available:

```java
Task.Backgroundable.queue(
    project,
    LocalizeValue.localizeTODO("Downloading files"),
    true,   // canBeCancelled
    null,   // PerformInBackgroundOption (null for default)
    indicator -> {
        // work
    },
    () -> {
        // onSuccess -- runs on UI thread
    }
);
```

### Task.Modal

A modal task blocks the IDE with a modal progress dialog while it runs. Use modal tasks only when the user must wait for the result before continuing.

```java
new Task.Modal(project, LocalizeValue.localizeTODO("Applying changes"), true) {
    @Override
    public void run(@Nonnull ProgressIndicator indicator) {
        // work that must complete before the user can continue
    }
}.queue();
```

A static helper is also available:

```java
Task.Modal.queue(project, LocalizeValue.localizeTODO("Applying changes"), true, indicator -> {
    // work
});
```

### Task.ConditionalModal

`Task.ConditionalModal` extends `Task.Backgroundable` and represents a task that behaves as either modal or backgroundable depending on a `PerformInBackgroundOption`. Its `isConditionalModal()` method returns `true`.

### Task Lifecycle Callbacks

All `Task` subclasses support these callbacks, each invoked on the UI thread:

| Callback | When it is called |
|---|---|
| `onSuccess()` | After `run()` completes without throwing |
| `onCancel()` | When `run()` throws `ProcessCanceledException` or the indicator is cancelled |
| `onThrowable(Throwable)` | When `run()` throws any other exception |
| `onFinished()` | Always, after one of the above callbacks |

## ProgressIndicator

[`ProgressIndicator`](https://github.com/consulo/consulo/blob/master/modules/base/application-api/src/main/java/consulo/application/progress/ProgressIndicator.java)
is the interface used to report progress and check for cancellation inside a running task.

### Displaying Progress Text

```java
// primary status text (above the progress bar)
indicator.setTextValue(LocalizeValue.localizeTODO("Processing module: core"));

// secondary detail text (below the progress bar)
indicator.setText2Value(LocalizeValue.localizeTODO("Analyzing file: Main.java"));
```

The deprecated `setText(String)` and `setText2(String)` methods delegate to `setTextValue()` and `setText2Value()` respectively. Prefer the `LocalizeValue` variants in new code.

### Reporting Fraction

For a determinate progress bar, report progress as a fraction between `0.0` and `1.0`:

```java
indicator.setIndeterminate(false);
for (int i = 0; i < items.size(); i++) {
    indicator.setFraction((double) i / items.size());
    process(items.get(i));
}
```

### Indeterminate Progress

When the total amount of work is unknown, set the indicator to indeterminate mode:

```java
indicator.setIndeterminate(true);
```

In indeterminate mode, `setFraction()` has no visible effect.

### Cancellation

Check whether the user has requested cancellation:

```java
// Throws ProcessCanceledException if cancelled
indicator.checkCanceled();

// Query without throwing
if (indicator.isCanceled()) {
    // clean up and return
}
```

`checkCanceled()` should be called frequently in loops and between significant steps. Failure to do so can cause UI freezes because the platform cannot interrupt the operation promptly.

### Convenience Static Methods on ProgressManager

`ProgressManager` provides static convenience methods that operate on the current thread's indicator:

```java
// Sets text and checks for cancellation
ProgressManager.progress(LocalizeValue.localizeTODO("Loading..."));

// Sets both primary and secondary text, checks for cancellation
ProgressManager.progress(
    LocalizeValue.localizeTODO("Loading module"),
    LocalizeValue.localizeTODO("core-api")
);

// Sets secondary text only, checks for cancellation
ProgressManager.progress2(LocalizeValue.localizeTODO("Scanning file.java"));
```

## Modal vs Non-Modal Tasks: Choosing the Right Approach

| Approach | When to use |
|---|---|
| `Task.Backgroundable` | Default choice. The user can continue working while the task runs in the background. |
| `Task.Modal` | The result is needed immediately and the user cannot proceed without it. |
| `runProcessWithProgressSynchronously()` | Similar to modal, but as a one-shot call rather than a `Task` subclass. |
| `runProcess()` | Low-level. Associates a progress indicator with a `Runnable` on the current thread. Useful with invisible indicators for cancellation tracking. |

### General Guidelines

- Always call `checkCanceled()` frequently in long-running loops.
- Use `setIndeterminate(false)` and `setFraction()` when you can estimate progress; otherwise use `setIndeterminate(true)`.
- Prefer `Task.Backgroundable` over `Task.Modal` to keep the IDE responsive.
- Do not catch `ProcessCanceledException` -- let it propagate.
- Use `LocalizeValue` variants for all text-setting methods in new code.
