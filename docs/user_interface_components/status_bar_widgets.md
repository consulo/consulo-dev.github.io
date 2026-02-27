---
title: Status Bar Widgets
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Status bar widgets are small UI components displayed in the status bar at the bottom of the IDE window. They provide at-a-glance information to the user, such as cursor position, encoding, line separator, VCS branch, or custom plugin-specific indicators. Users can configure which widgets are visible through the status bar context menu or IDE settings.

## StatusBarWidgetFactory

[`StatusBarWidgetFactory`](https://github.com/consulo/consulo/blob/master/modules/base/project-ui-api/src/main/java/consulo/project/ui/wm/StatusBarWidgetFactory.java) is the extension point for adding user-configurable widgets to the status bar. It is annotated with `@ExtensionAPI(ComponentScope.PROJECT)`, so implementations are registered by annotating the class with `@ExtensionImpl`.

The `@ExtensionImpl` annotation must include a non-empty `id` attribute, which serves as the widget identifier used to store visibility settings.

### Key Methods

| Method | Return Type | Description |
|---|---|---|
| `getId()` | `String` | Returns the widget identifier. By default, reads the `id` from the `@ExtensionImpl` annotation. |
| `getDisplayName()` | `String` | Returns the widget's display name, used in UI for enable/disable actions and settings checkboxes. |
| `isAvailable(Project)` | `boolean` | Returns whether the widget is available for the given project. Return `false` to prevent widget creation or to dispose it. |
| `createWidget(Project)` | `StatusBarWidget` | Creates the widget instance to be added to the status bar. Called once on project initialization; the widget is not recreated implicitly. |
| `disposeWidget(StatusBarWidget)` | `void` | Disposes the widget. The default implementation calls `Disposer.dispose(widget)`. |
| `canBeEnabledOn(StatusBar)` | `boolean` | Returns whether the widget can be enabled on the given status bar. The status bar context menu depends on this result. |
| `isEnabledByDefault()` | `boolean` | Returns `true` if the widget should be created by default (default: `true`). Otherwise, the user must enable it explicitly. |
| `isConfigurable()` | `boolean` | Returns whether the user should be able to enable or disable the widget (default: `true`). Some widgets are controlled by application-level settings and should not be configurable via the context menu. |

> **NOTE** When the widget's availability changes at runtime, you must explicitly call `StatusBarWidgetsManager.updateWidget(StatusBarWidgetFactory)` to update the status bar.

## StatusBarWidget

[`StatusBarWidget`](https://github.com/consulo/consulo/blob/master/modules/base/project-ui-api/src/main/java/consulo/project/ui/wm/StatusBarWidget.java) is the interface for the widget instance itself. It extends `Disposable` and defines the following methods:

| Method | Return Type | Description |
|---|---|---|
| `getId()` | `String` | Returns the unique identifier for this widget. |
| `getPresentation()` | `WidgetPresentation` | Returns the presentation that determines how the widget is rendered. |
| `install(StatusBar)` | `void` | Called when the widget is installed into a status bar. Use this to subscribe to events and set up the widget state. |
| `beforeUpdate()` | `void` | Called on the UI thread before the widget is updated. Annotated with `@RequiredUIAccess`. |

The `StatusBarWidget.Multiframe` sub-interface adds a `copy()` method, allowing the widget to be duplicated across multiple editor frames.

### Presentation Types

The visual appearance of a status bar widget is determined by its `WidgetPresentation`. The base `WidgetPresentation` interface defines:

- `getTooltipText()` -- returns the tooltip as a `LocalizeValue`.
- `getShortcutText()` -- returns an optional shortcut text string.
- `getClickConsumer()` -- returns an optional `Consumer<MouseEvent>` invoked when the widget is clicked.

Three specialized presentation interfaces extend `WidgetPresentation`:

#### IconPresentation

Displays the widget as an icon.

| Method | Return Type | Description |
|---|---|---|
| `getIcon()` | `Image` | Returns the icon to display, or `null` if no icon should be shown. |

#### TextPresentation

Displays the widget as a text label.

| Method | Return Type | Description |
|---|---|---|
| `getText()` | `String` | Returns the text to display. |
| `getAlignment()` | `float` | Returns the horizontal alignment of the text (e.g., `Component.CENTER_ALIGNMENT`). |

#### MultipleTextValuesPresentation

Displays the widget as a text label with a popup for selecting among multiple values.

| Method | Return Type | Description |
|---|---|---|
| `getPopupStep()` | `ListPopup` | Returns the popup shown when the widget is clicked, or `null` if the popup cannot be shown. |
| `getSelectedValue()` | `String` | Returns the currently selected value to display. Annotated with `@RequiredUIAccess`. |
| `getIcon()` | `Image` | Returns an optional icon to display alongside the text. |

## Registration

A status bar widget factory is registered by annotating the implementation class with `@ExtensionImpl` and providing a unique `id`:

```java
@ExtensionImpl(id = "myCustomWidget")
public class MyWidgetFactory implements StatusBarWidgetFactory {

    @Nonnull
    @Override
    public String getDisplayName() {
        return "My Custom Widget";
    }

    @Override
    public boolean isAvailable(@Nonnull Project project) {
        return true;
    }

    @Nonnull
    @Override
    public StatusBarWidget createWidget(@Nonnull Project project) {
        return new MyStatusBarWidget(project);
    }

    @Override
    public boolean canBeEnabledOn(@Nonnull StatusBar statusBar) {
        return true;
    }
}
```

## Implementing a Widget

Below is an example of a widget that displays text in the status bar:

```java
public class MyStatusBarWidget implements StatusBarWidget, StatusBarWidget.TextPresentation {
    private final Project myProject;
    private StatusBar myStatusBar;

    public MyStatusBarWidget(@Nonnull Project project) {
        myProject = project;
    }

    @Nonnull
    @Override
    public String getId() {
        return "myCustomWidget";
    }

    @Override
    public void install(@Nonnull StatusBar statusBar) {
        myStatusBar = statusBar;
    }

    @Nullable
    @Override
    public WidgetPresentation getPresentation() {
        return this;
    }

    @Nonnull
    @Override
    public String getText() {
        return "Hello, Status Bar!";
    }

    @Override
    public float getAlignment() {
        return 0.5f; // Center alignment
    }

    @Nonnull
    @Override
    public LocalizeValue getTooltipText() {
        return LocalizeValue.localizeTODO("My custom status bar widget");
    }

    @Nullable
    @Override
    public Consumer<MouseEvent> getClickConsumer() {
        return event -> {
            // Handle click
        };
    }

    @Override
    public void dispose() {
        // Clean up resources
    }
}
```

For widgets that display an icon, implement `StatusBarWidget.IconPresentation` instead. For widgets that offer a popup with multiple selectable values, implement `StatusBarWidget.MultipleTextValuesPresentation` and provide a `ListPopup` via `getPopupStep()`.
