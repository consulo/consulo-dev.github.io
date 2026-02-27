---
title: Logging
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

## Overview

Consulo provides a platform-wide logging facility through the
[`Logger`](https://github.com/consulo/consulo/blob/master/modules/base/logging-api/src/main/java/consulo/logging/Logger.java)
interface in the `consulo.logging` package. It supports standard log levels and is the recommended way to emit diagnostic messages from plugin code.

## Obtaining a Logger Instance

`Logger` provides two static factory methods:

```java
// By class -- the fully qualified class name is used as the logger category
private static final Logger LOG = Logger.getInstance(MyService.class);

// By explicit category name
private static final Logger LOG = Logger.getInstance("my.plugin.category");
```

Logger instances are typically stored as `private static final` fields so that a single instance is shared across all usages within a class.

## Log Levels

The `Logger` interface defines five log levels, listed from most to least severe:

### error()

Logs a message at the **error** level. This level indicates a serious failure that should be investigated. Calling `error()` will also record a `Throwable` stack trace automatically if one is not supplied explicitly.

```java
LOG.error("Failed to load configuration");
LOG.error("Failed to load configuration", exception);
LOG.error("Failed to load configuration", exception, "additional detail 1", "additional detail 2");
```

Variants accepting `Attachment` objects are available for including file contents or other data:

```java
LOG.error("Unexpected PSI state", new Attachment("file.txt", fileContent));
```

### warn()

Logs a message at the **warn** level. Use this for situations that are unexpected but recoverable.

```java
LOG.warn("Configuration file not found, using defaults");
LOG.warn("Unexpected state encountered", exception);
```

### info()

Logs a message at the **info** level. Use this for significant but normal events such as lifecycle milestones.

```java
LOG.info("Plugin initialized successfully");
LOG.info("Connection established", exception); // includes stack trace for context
```

### debug()

Logs a message at the **debug** level. Use this for detailed diagnostic information useful during development. Debug messages are typically **disabled** in production.

```java
LOG.debug("Processing element: " + element.getName());
LOG.debug("Cache miss for key", throwable);
```

A varargs variant is also available that concatenates arguments only when debug logging is enabled:

```java
LOG.debug("Resolved reference: ", target, " in file: ", file);
```

### trace()

Logs a message at the **trace** level, which is finer-grained than debug. Use this for very detailed internal events within a subsystem to avoid overwhelming the log when only debug level is enabled. By default, `trace()` delegates to `debug()` and `isTraceEnabled()` delegates to `isDebugEnabled()`.

```java
LOG.trace("Entering method processToken");
LOG.trace(exception);
```

## Guarding Expensive Log Statements

When constructing a log message is expensive (e.g., involves string concatenation or calling `toString()` on complex objects), guard the call with `isDebugEnabled()` or `isTraceEnabled()`:

```java
if (LOG.isDebugEnabled()) {
    LOG.debug("Detailed tree structure: " + psiElement.subtreeToString());
}

if (LOG.isTraceEnabled()) {
    LOG.trace("Token stream: " + tokenStream.dump());
}
```

This avoids the cost of building the message string when the corresponding log level is not active.

## Assertions with assertTrue()

`Logger` provides an assertion method that logs an error (rather than throwing) when a condition is not met:

```java
LOG.assertTrue(googler != null, "Expected non-null Googler instance");
```

If the condition is `false`, an error is logged with the message `"Assertion failed: Expected non-null Googler instance"` and a `Throwable` is recorded for the stack trace. The method returns the value of the condition, which can be useful in boolean expressions:

```java
// Short form without a message
LOG.assertTrue(googler != null);
```

## Best Practices

- Declare loggers as `private static final Logger LOG = Logger.getInstance(YourClass.class)`.
- Use `error()` only for genuinely unexpected failures. Overusing it creates noise and makes real errors harder to spot.
- Prefer `warn()` for recoverable problems and `info()` for important lifecycle events.
- Guard expensive `debug()` / `trace()` calls with `isDebugEnabled()` / `isTraceEnabled()`.
- Use `assertTrue()` for internal invariant checks during development; do not use it as a substitute for proper input validation.
- Use the varargs `debug(String message, Object... details)` overload when you want automatic concatenation that is skipped if debug is disabled.
