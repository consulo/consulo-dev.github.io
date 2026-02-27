---
title: 3. Handling Editor Events
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The previous tutorial [Editor Coordinate Systems](coordinates_system.md) described working with caret coordinate systems in an editor window.
Caret position was discussed in terms of Logical Position, Visual Position, and Offset.
This tutorial introduces the Editor Action system, which handles actions activated by keystroke events in the editor.
Two classes from the editor_basics code sample are used to illustrate:
* Using a Consulo [`EditorActionHandler`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionHandler.java) to manipulate a caret.
* Creating and registering a custom [`TypedActionHandler`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/TypedActionHandler.java) to intercept keystrokes and change the document.

The tutorial presents the following sections:


## Using an Consulo EditorActionHandler
In this portion of the tutorial, the editor_basics code sample is used to demonstrate cloning an existing caret.
A custom action class will use [`EditorActionManager`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionManager.java) to access a specific [`EditorActionHandler`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionHandler.java) for caret cloning.
The `editor_basics` code sample adds an **Editor Add Caret** menu item to the editor context menu:

<img src="./img/basics.png" alt="Editor Basics Menu" width="600" />

### Creating the Menu Action Class
The source code for the Java action class is `EditorHandlerIllustration`, a subclass of [`AnAction`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java).
For more information about creating action classes, see the [Actions Tutorial](/tutorials/action_system.md) which covers the topic in depth.

The `EditorHandlerIllustration` action is registered using the `@ActionImpl` annotation.
Note that this action class is registered to appear on the Editor context menu.

```java
@ActionImpl(id = "EditorBasics.EditorHandlerIllustration", parents = @ActionParentRef(@ActionRef(id = "EditorPopupMenu")))
public class EditorHandlerIllustration extends AnAction {
    // ...
}
```

### Setting Visibility for the Action Menu Entry
Under what conditions should the `EditorHandlerIllustration` action be capable of cloning a caret?
Only if the following conditions are met in the `EditorHandlerIllustration.update()` method:
* A project is open,
* An editor is available,
* There is at least one caret active in the editor.

After ensuring that [`Project`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/Project.java) and [`Editor`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/Editor.java) objects are available, the [`Editor`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/Editor.java) object is used to verify there is at least one caret:

```java
public class EditorHandlerIllustration extends AnAction {
  @Override
  public void update(@NotNull final AnActionEvent e) {
    final Project project = e.getProject();
    final Editor editor = e.getData(CommonDataKeys.EDITOR);

    // Make sure at least one caret is available
    boolean menuAllowed = false;
    if (editor != null && project != null) {
      // Ensure the list of carets in the editor is not empty
      menuAllowed = !editor.getCaretModel().getAllCarets().isEmpty();
    }
    e.getPresentation().setEnabledAndVisible(menuAllowed);
  }
}
```

### Acquiring the Correct EditorActionHandler
When the `EditorHandlerIllustration.actionPerformed()` method clones the caret, it should use the appropriate Consulo [`EditorActionHandler`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionHandler.java).
An instance of [`EditorActionManager`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionManager.java) is required to obtain the correct [`EditorActionHandler`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionHandler.java).
The [`EditorActionManager`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionManager.java) class provides a static method to do this.

To request the correct [`EditorActionHandler`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionHandler.java) from [`EditorActionManager`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionManager.java), consult the [`IdeActions`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/IdeActions.java) interface for the correct constant to pass into the [`EditorActionManager.getActionHandler()`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionManager.java) method.
For cloning a caret below the primary caret, the constant is `ACTION_EDITOR_CLONE_CARET_BELOW`.
Based on that constant, the [`EditorActionManager`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionManager.java) returns an instance of `CloneCaretActionHandler`, a subclass of [`EditorActionHandler`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionHandler.java).

```java
    // Snippet from EditorHandlerIllustration.actionPerformed()
    final EditorActionManager actionManager = EditorActionManager.getInstance();
    final EditorActionHandler actionHandler = actionManager.getActionHandler(IdeActions.ACTION_EDITOR_CLONE_CARET_BELOW);
```

### Using an EditorActionHandler to Clone the Caret
To clone the caret requires only calling the [`EditorActionHandler.execute()`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionHandler.java) method and passing in the appropriate context.

```java
public class EditorHandlerIllustration extends AnAction {
  @Override
  public void actionPerformed(@NotNull final AnActionEvent e) {
    final Editor editor = e.getRequiredData(CommonDataKeys.EDITOR);
    final EditorActionManager actionManager = EditorActionManager.getInstance();
    final EditorActionHandler actionHandler = actionManager.getActionHandler(IdeActions.ACTION_EDITOR_CLONE_CARET_BELOW);
    actionHandler.execute(editor, editor.getCaretModel().getPrimaryCaret(), e.getDataContext());
  }
}
```


## Creating a Custom TypedActionHandler
The [`TypedActionHandler`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/TypedActionHandler.java) interface is the basis for classes that handle keystroke events from the editor.
Custom implementations of the class are registered to handle editor keystroke events, and receive a callback for each keystroke.
The steps below explain how to use [`TypedActionHandler`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/TypedActionHandler.java) to customize the behavior of the editor when keystroke events are received.

### Implementing a Custom TypedActionHandler Class
First, a subclass such as `MyTypedHandler` is created based on [`TypedActionHandler`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/TypedActionHandler.java).
The class overrides the method [`TypedActionHandler.execute()`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/TypedActionHandler.java), which is the callback for editor keystroke events.

### Implementing the Keystroke Event Handling Logic
Override the [`TypedActionHandler.execute()`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/TypedActionHandler.java) method in `MyTypedHandler` to implement the logic for handling keystroke events.
This method is called every time a key is pressed when the Editor Tool Window has focus.

In the following example, the `MyTypedHandler.execute()` method inserts "editor_basics\n" at the zero [caret Offset](coordinates_system.md#caret-offset) position when a keystroke event occurs.
As explained in [Working with Text](working_with_text.md#safely-replacing-selected-text-in-the-document), safe modifications to the document must be in the context of a write action.
So although a method on the [`Document`](https://github.com/consulo/consulo/blob/master/modules/base/document-api/src/main/java/consulo/document/Document.java) interface does the `String` insertion, the write action ensures a stable context.

```java
class MyTypedHandler implements TypedActionHandler {
  @Override
  public void execute(@NotNull Editor editor, char c, @NotNull DataContext dataContext) {
    final Document document = editor.getDocument();
    final Project project = editor.getProject();
    Runnable runnable = () -> document.insertString(0, "editor_basics\n");
    WriteCommandAction.runWriteCommandAction(project, runnable);
  }
}
```

### Registering a Custom TypedActionHandler
A custom implementation of [`TypedActionHandler`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/TypedActionHandler.java) must be registered to replace the existing typing handler to receive editor keystroke events.
The registration is done through the [`TypedAction`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/TypedAction.java) class.

As is shown in the snippet below, the [`EditorActionManager`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/EditorActionManager.java) is used to get access to the [`TypedAction`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/TypedAction.java) class.
The method [`TypedAction.setupHandler()`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/action/TypedAction.java) is used to register the custom `MyTypedHandler` class:

```java
public class EditorHandlerIllustration extends AnAction {
    static {
        final EditorActionManager actionManager = EditorActionManager.getInstance();
        final TypedAction typedAction = actionManager.getTypedAction();
        typedAction.setupHandler(new MyTypedHandler());
    }
}
```

Placing the registration code in the `EditorHandlerIllustration` class is somewhat arbitrary in the sense that the registration of `MyTypedHandler` has nothing to do with the `EditorHandlerIllustration` class.
However, the `EditorHandlerIllustration` class is convenient because as an action it gets instantiated at application startup.
On instantiation, the `static` block of code in `EditorHandlerIllustration` gets evaluated.
In the `editor_basics` code sample any of the [`AnAction`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-api/src/main/java/consulo/ui/ex/action/AnAction.java) derived classes would work for registering `MyTypedHandler`.
