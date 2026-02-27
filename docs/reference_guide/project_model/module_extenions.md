---
title: Module Extensions
---

A _module extension_ represents framework- or language-specific configuration associated with a module.
Unlike facets in IntelliJ IDEA, Consulo uses module extensions as a unified mechanism for attaching per-module settings such as SDK references, language levels, compiler options, and more.

A module can have multiple module extensions enabled simultaneously.
For example, a module might have both a Java module extension (configuring language level and bytecode version) and a Spring module extension.

## Architecture

The module extension system follows an **immutable/mutable** pattern and uses the Consulo annotation-based registration:

| Class / Interface | Role |
|---|---|
| [`ModuleExtensionProvider`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/layer/ModuleExtensionProvider.java) | Factory that creates extension instances. Annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`. |
| [`ModuleExtension`](https://github.com/consulo/consulo/blob/master/modules/base/module-api/src/main/java/consulo/module/extension/ModuleExtension.java) | Read-only extension interface. Extends `PersistentStateComponent<Element>` for serialization. |
| [`MutableModuleExtension`](https://github.com/consulo/consulo/blob/master/modules/base/module-api/src/main/java/consulo/module/extension/MutableModuleExtension.java) | Editable variant used in the Project Structure UI. Adds `setEnabled()`, `isModified()`, and `createConfigurationComponent()`. |
| [`ModuleExtensionBase`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/layer/extension/ModuleExtensionBase.java) | Base implementation with built-in enabled/disabled state and XML persistence. |
| [`ModuleExtensionWithSdkBase`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/layer/extension/ModuleExtensionWithSdkBase.java) | Extends `ModuleExtensionBase` with SDK pointer support for extensions that reference an SDK. |
| [`ModuleExtensionHelper`](https://github.com/consulo/consulo/blob/master/modules/base/module-api/src/main/java/consulo/module/extension/ModuleExtensionHelper.java) | Project-scoped service (`@ServiceAPI(ComponentScope.PROJECT)`) for querying enabled extensions across all modules. |

### How It Works

1. `ModuleExtensionProvider` is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)` -- it is the extension point.
2. Plugin authors implement `ModuleExtensionProvider` and annotate their implementation with `@ExtensionImpl`.
3. When a module root layer is created, the platform iterates all registered `ModuleExtensionProvider` instances and calls `createImmutableExtension()` or `createMutableExtension()` to instantiate extensions.
4. Each extension stores its state via `PersistentStateComponent<Element>` -- serialized into the module's `.consulo` directory.
5. In the Project Structure dialog, `MutableModuleExtension.createConfigurationComponent()` provides the per-extension settings UI.

## Creating a Module Extension

A typical module extension consists of four classes:

### 1. The Immutable Extension

Extend [`ModuleExtensionBase`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/layer/extension/ModuleExtensionBase.java) (or [`ModuleExtensionWithSdkBase`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/layer/extension/ModuleExtensionWithSdkBase.java) if your extension references an SDK):

```java
public class MyModuleExtension extends ModuleExtensionBase<MyModuleExtension> {

    public MyModuleExtension(@Nonnull String id, @Nonnull ModuleRootLayer moduleRootLayer) {
        super(id, moduleRootLayer);
    }

    @RequiredReadAction
    @Override
    public void commit(@Nonnull MyModuleExtension mutableModuleExtension) {
        super.commit(mutableModuleExtension);
        // copy additional fields from the mutable extension
    }

    @Override
    protected void getStateImpl(@Nonnull Element element) {
        // write custom state to XML element
    }

    @RequiredReadAction
    @Override
    protected void loadStateImpl(@Nonnull Element element) {
        // read custom state from XML element
    }
}
```

Key points:
- The constructor receives the extension `id` and the [`ModuleRootLayer`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/layer/ModuleRootLayer.java) it belongs to.
- `commit()` copies state from a mutable extension into this instance when the user applies changes.
- `getStateImpl()` / `loadStateImpl()` handle XML serialization. The base class already handles the `enabled` flag and the `id` attribute.

If your extension needs an SDK reference, extend `ModuleExtensionWithSdkBase` instead and implement `getSdkTypeClass()`:

```java
public class MyModuleExtension extends ModuleExtensionWithSdkBase<MyModuleExtension> {

    public MyModuleExtension(@Nonnull String id, @Nonnull ModuleRootLayer moduleRootLayer) {
        super(id, moduleRootLayer);
    }

    @Nonnull
    @Override
    public Class<? extends SdkType> getSdkTypeClass() {
        return MySdkType.class;
    }
}
```

### 2. The Mutable Extension

Extend your immutable extension and implement [`MutableModuleExtension`](https://github.com/consulo/consulo/blob/master/modules/base/module-api/src/main/java/consulo/module/extension/MutableModuleExtension.java) (or [`MutableModuleExtensionWithSdk`](https://github.com/consulo/consulo/blob/master/modules/base/module-api/src/main/java/consulo/module/extension/MutableModuleExtensionWithSdk.java) for SDK-based extensions):

```java
public class MyMutableModuleExtension extends MyModuleExtension
        implements MutableModuleExtension<MyModuleExtension> {

    public MyMutableModuleExtension(@Nonnull String id, @Nonnull ModuleRootLayer moduleRootLayer) {
        super(id, moduleRootLayer);
    }

    @Override
    public void setEnabled(boolean val) {
        myIsEnabled = val;
    }

    @Override
    public boolean isModified(@Nonnull MyModuleExtension originalExtension) {
        return myIsEnabled != originalExtension.isEnabled();
    }

    @RequiredUIAccess
    @Nullable
    @Override
    public Component createConfigurationComponent(
            @Nonnull Disposable uiDisposable, @Nonnull Runnable updateOnCheck) {
        // build and return the settings UI
        return VerticalLayout.create();
    }
}
```

Key points:
- `setEnabled()` toggles the extension on/off in the UI.
- `isModified()` checks whether the mutable state differs from the original (persisted) state.
- `createConfigurationComponent()` returns the UI panel shown in the **Project Structure > Modules** dialog when the extension is selected.

### 3. The Extension Provider

Implement [`ModuleExtensionProvider`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/layer/ModuleExtensionProvider.java) and annotate with `@ExtensionImpl`:

```java
@ExtensionImpl
public class MyModuleExtensionProvider
        implements ModuleExtensionProvider<MyModuleExtension> {

    @Nonnull
    @Override
    public String getId() {
        return "my-framework";
    }

    @Nonnull
    @Override
    public LocalizeValue getName() {
        return LocalizeValue.localizeTODO("My Framework");
    }

    @Nonnull
    @Override
    public Image getIcon() {
        return MyIcons.FrameworkIcon;
    }

    @Nonnull
    @Override
    public ModuleExtension<MyModuleExtension> createImmutableExtension(
            @Nonnull ModuleRootLayer layer) {
        return new MyModuleExtension(getId(), layer);
    }

    @Nonnull
    @Override
    public MutableModuleExtension<MyModuleExtension> createMutableExtension(
            @Nonnull ModuleRootLayer layer) {
        return new MyMutableModuleExtension(getId(), layer);
    }
}
```

`ModuleExtensionProvider` is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)` -- your implementation only needs `@ExtensionImpl`.

#### Provider Methods

| Method | Description |
|---|---|
| `getId()` | Unique string identifier for this extension (e.g., `"java"`, `"spring"`). |
| `getParentId()` | Optional parent extension ID. Returns `null` by default. Used for hierarchical extensions. |
| `getName()` | Human-readable display name shown in the UI. |
| `getIcon()` | Icon displayed alongside the extension name. |
| `isAllowMixin()` | Whether the extension can coexist with overlapping extensions. Default `false`. |
| `isSystemOnly()` | Whether the extension is system-internal and hidden from the user. Default `false`. |
| `createImmutableExtension()` | Factory method for the read-only extension instance. |
| `createMutableExtension()` | Factory method for the editable extension instance. |

## Accessing Module Extensions

### From a Module

Use [`ModuleUtilCore.getExtension()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/util/ModuleUtilCore.java) or the `ModuleRootLayer` API:

```java
// By class
MyModuleExtension ext = ModuleUtilCore.getExtension(module, MyModuleExtension.class);

// By ID
ModuleRootManager rootManager = ModuleRootManager.getInstance(module);
MyModuleExtension ext = rootManager.getExtension("my-framework");
```

### Across All Modules

Use [`ModuleExtensionHelper`](https://github.com/consulo/consulo/blob/master/modules/base/module-api/src/main/java/consulo/module/extension/ModuleExtensionHelper.java), a `@ServiceAPI(ComponentScope.PROJECT)` service:

```java
ModuleExtensionHelper helper = ModuleExtensionHelper.getInstance(project);

// Check if any module has the extension enabled
boolean hasIt = helper.hasModuleExtension(MyModuleExtension.class);

// Get all enabled instances across modules
Collection<MyModuleExtension> all = helper.getModuleExtensions(MyModuleExtension.class);
```

### From a ModuleRootLayer

[`ModuleRootLayer`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/layer/ModuleRootLayer.java) provides direct access:

```java
// By class (returns null if not enabled)
MyModuleExtension ext = layer.getExtension(MyModuleExtension.class);

// By ID (returns null if not enabled)
MyModuleExtension ext = layer.getExtension("my-framework");

// By class, ignoring enabled state
MyModuleExtension ext = layer.getExtensionWithoutCheck(MyModuleExtension.class);

// All extensions (enabled only)
List<ModuleExtension> extensions = layer.getExtensions();
```

## Real-World Example: Java Module Extension

The Java language plugin in [`consulo-java`](https://github.com/consulo/consulo-java) provides a full module extension implementation:

**Provider** -- `JavaModuleExtensionProvider` is annotated with `@ExtensionImpl` and registers the `"java"` extension ID. It creates `JavaModuleExtensionImpl` (immutable) and `JavaMutableModuleExtensionImpl` (mutable) instances.

**Extension interface** -- `JavaModuleExtension` extends `ModuleExtensionWithSdk` and adds:
- `getLanguageLevel()` -- the effective Java language level (user-set or derived from SDK)
- `getBytecodeVersion()` -- the target bytecode version
- `getCompilerArguments()` -- additional compiler flags
- `getSpecialDirLocation()` -- whether special directories are relative to module root or source root
- `getCompilationClasspath()` / `getCompilationBootClasspath()` -- resolved classpaths for compilation

**Immutable implementation** -- `JavaModuleExtensionImpl` extends `ModuleExtensionWithSdkBase` and persists language level, bytecode version, compiler arguments, and special directory location via `getStateImpl()` / `loadStateImpl()`.

**Mutable implementation** -- `JavaMutableModuleExtensionImpl` extends `JavaModuleExtensionImpl`, implements `JavaMutableModuleExtension`, and provides a Swing-based settings panel (`JavaModuleExtensionPanel`) for configuring the SDK, language level, bytecode version, and compiler arguments.

## Extension Hierarchy

Module extensions support a parent-child hierarchy via `getParentId()`.
A child extension appears nested under its parent in the Project Structure UI.
For example, a "Java EE" extension might return `"java"` from `getParentId()` to appear as a sub-extension of the Java extension.

## SDK-Based Extensions

For extensions that associate an SDK with a module, use the SDK-aware base classes:

- Extend [`ModuleExtensionWithSdkBase`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/layer/extension/ModuleExtensionWithSdkBase.java) for the immutable extension
- Implement [`MutableModuleExtensionWithSdk`](https://github.com/consulo/consulo/blob/master/modules/base/module-api/src/main/java/consulo/module/extension/MutableModuleExtensionWithSdk.java) for the mutable extension

These base classes manage an [`ModuleInheritableNamedPointer<Sdk>`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/layer/extension/ModuleInheritableNamedPointerImpl.java) that supports inheriting the SDK from another module, and automatically persist the SDK reference.
