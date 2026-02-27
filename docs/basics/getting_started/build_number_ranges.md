---
title: Platform Versioning
---

## Consulo Versioning

Consulo uses a simple linear versioning scheme. There are no separate release branches or fix versions for older releases. All development happens on the main branch.

### Platform Version

Each Consulo build produced by [jenkins.consulo.io](https://jenkins.consulo.io) is assigned an incrementing platform version number. Plugins declare the platform version using the `<platformVersion>` element in `plugin.xml`:

```xml
<platformVersion>SNAPSHOT</platformVersion>
```

The value must always be set to `SNAPSHOT` in source code. During deployment, the actual platform version number is substituted automatically.

### Maven Artifacts

All Maven artifacts are published under a single shared snapshot version — `3-SNAPSHOT`. There are no release artifacts or versioned releases for older platform versions. When building a plugin, use `3-SNAPSHOT` as the dependency version:

```xml
<version>3-SNAPSHOT</version>
```

### Differences from IntelliJ Platform

Unlike the IntelliJ Platform, Consulo does **not** use:

* Multi-part build numbers (e.g. `IU-162.94.11`)
* Branch-based versioning (e.g. `YYYY.R`)
* `since-build` / `until-build` attributes
* `<idea-version>` element
* Release versions or fix branches for older versions

Instead, Consulo uses `<platformVersion>SNAPSHOT</platformVersion>` (resolved at deploy time), and `3-SNAPSHOT` for all Maven dependencies.
