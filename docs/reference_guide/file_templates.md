---
title: File Templates
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

File templates provide a way to create new files pre-populated with boilerplate code. Consulo includes a built-in file template engine based on the Apache Velocity template language. Plugins can contribute their own file template groups and define actions that create files from these templates.

## Key Classes

### FileTemplateGroupDescriptorFactory

[`FileTemplateGroupDescriptorFactory`](https://github.com/consulo/consulo/blob/master/modules/base/file-template-api/src/main/java/consulo/fileTemplate/FileTemplateGroupDescriptorFactory.java) (`consulo.fileTemplate.FileTemplateGroupDescriptorFactory`) is the extension point interface for registering file template groups. It is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`.

The interface defines a single method:

| Method | Description |
|--------|-------------|
| `getFileTemplatesDescriptor()` | Returns a `FileTemplateGroupDescriptor` that describes the group of file templates contributed by the plugin. May return `null` if no templates are available. |

### FileTemplateGroupDescriptor

[`FileTemplateGroupDescriptor`](https://github.com/consulo/consulo/blob/master/modules/base/file-template-api/src/main/java/consulo/fileTemplate/FileTemplateGroupDescriptor.java) (`consulo.fileTemplate.FileTemplateGroupDescriptor`) extends `FileTemplateDescriptor` and represents a named group of file templates. It provides:

| Method | Description |
|--------|-------------|
| `FileTemplateGroupDescriptor(String title, Image icon)` | Creates a group with the given title and icon. |
| `FileTemplateGroupDescriptor(String title, Image icon, FileTemplateDescriptor... children)` | Creates a group with the given title, icon, and initial child templates. |
| `getTitle()` | Returns the title of the group. |
| `getTemplates()` | Returns the array of `FileTemplateDescriptor` entries in this group. |
| `addTemplate(FileTemplateDescriptor descriptor)` | Adds a template descriptor to the group. |
| `addTemplate(String fileName)` | Adds a template by file name. The icon is resolved automatically from the file type. |

### FileTemplateDescriptor

[`FileTemplateDescriptor`](https://github.com/consulo/consulo/blob/master/modules/base/file-template-api/src/main/java/consulo/fileTemplate/FileTemplateDescriptor.java) (`consulo.fileTemplate.FileTemplateDescriptor`) is a data class that describes a single file template entry.

| Method | Description |
|--------|-------------|
| `FileTemplateDescriptor(String fileName)` | Creates a descriptor for the given file name. The icon is determined automatically from the file type associated with the file name. |
| `FileTemplateDescriptor(String fileName, Image icon)` | Creates a descriptor with an explicit icon. |
| `getFileName()` | Returns the template file name. |
| `getDisplayName()` | Returns the display name (delegates to `getFileName()`). |
| `getIcon()` | Returns the icon for this template entry, or `null`. |

### CreateFileFromTemplateAction

[`CreateFileFromTemplateAction`](https://github.com/consulo/consulo/blob/master/modules/base/ide-api/src/main/java/consulo/ide/action/CreateFileFromTemplateAction.java) (`consulo.ide.action.CreateFileFromTemplateAction`) is an abstract base class for actions that create new files from file templates. It extends `CreateFromTemplateAction<PsiFile>`.

Key methods to override or use:

| Method | Description |
|--------|-------------|
| `createFileFromTemplate(String name, FileTemplate template, PsiDirectory dir)` | Creates a `PsiFile` from the given template in the specified directory. |
| `createFileFromTemplate(String name, FileTemplate template, PsiDirectory dir, String defaultTemplateProperty, boolean openFile)` | Static utility method to create a file from a template with options for storing the default template and opening the file in the editor. |
| `createFileFromTemplate(String name, FileTemplate template, PsiDirectory dir, String defaultTemplateProperty, boolean openFile, Map<String, String> liveTemplateDefaultValues)` | Static utility method with additional live template default values. |
| `createFile(String name, String templateName, PsiDirectory dir)` | Called by the framework to create the file. Retrieves the internal template by name from `FileTemplateManager` and delegates to `createFileFromTemplate`. |
| `getFileTypeForModuleResolve()` | Override to return a `FileType` if the created file should trigger module content root resolution. |
| `postProcess(PsiFile createdElement, String templateName, Map<String, String> customProperties)` | Called after the file is created. Can be overridden to perform additional processing such as module resolution. |

The parent class `CreateFromTemplateAction` provides the dialog-based workflow where users enter a file name and select a template. Subclasses must implement:

| Method | Description |
|--------|-------------|
| `buildDialog(Project project, PsiDirectory directory, CreateFileFromTemplateDialog.Builder builder)` | Builds the creation dialog by adding template choices. |
| `getActionName(PsiDirectory directory, String newName, String templateName)` | Returns the action name displayed in the undo/redo stack. |

## Registering a FileTemplateGroupDescriptorFactory

To register a file template group, implement the `FileTemplateGroupDescriptorFactory` interface and annotate the implementation class with `@ExtensionImpl`:

```java
import consulo.annotation.component.ExtensionImpl;
import consulo.fileTemplate.FileTemplateDescriptor;
import consulo.fileTemplate.FileTemplateGroupDescriptor;
import consulo.fileTemplate.FileTemplateGroupDescriptorFactory;
import consulo.myLanguage.MyLanguageIcons;

@ExtensionImpl
public class MyLanguageFileTemplateGroupFactory implements FileTemplateGroupDescriptorFactory {
    @Override
    public FileTemplateGroupDescriptor getFileTemplatesDescriptor() {
        FileTemplateGroupDescriptor group =
            new FileTemplateGroupDescriptor("My Language", MyLanguageIcons.FILE);

        group.addTemplate(new FileTemplateDescriptor("MyLanguage File.mylang"));
        group.addTemplate(new FileTemplateDescriptor("MyLanguage Test.mylang"));

        return group;
    }
}
```

The template files themselves (e.g., `MyLanguage File.mylang.ft`) should be placed in the `fileTemplates/internal` directory of the plugin resources.

## Creating a "New File" Action

To add a "New > My Language File" action to the project view context menu, extend `CreateFileFromTemplateAction`:

```java
import consulo.annotation.component.ActionImpl;
import consulo.ide.action.CreateFileFromTemplateAction;
import consulo.ide.action.CreateFileFromTemplateDialog;
import consulo.language.psi.PsiDirectory;
import consulo.localize.LocalizeValue;
import consulo.project.Project;
import consulo.myLanguage.MyLanguageIcons;

public class CreateMyLanguageFileAction extends CreateFileFromTemplateAction {
    public CreateMyLanguageFileAction() {
        super(LocalizeValue.localizeTODO("My Language File"),
              LocalizeValue.localizeTODO("Creates a new My Language file"),
              MyLanguageIcons.FILE);
    }

    @Override
    protected void buildDialog(Project project, PsiDirectory directory,
                               CreateFileFromTemplateDialog.Builder builder) {
        builder.setTitle("New My Language File")
               .addKind("Source File", MyLanguageIcons.FILE, "MyLanguage File");
    }

    @Override
    protected String getDefaultTemplateProperty() {
        return "DefaultMyLanguageFileTemplate";
    }

    @Override
    protected LocalizeValue getActionName(PsiDirectory directory,
                                          String newName, String templateName) {
        return LocalizeValue.localizeTODO("Create My Language File " + newName);
    }
}
```

## How It Works

1. The plugin implements `FileTemplateGroupDescriptorFactory` annotated with `@ExtensionImpl` to declare available file templates.
2. Template files (`.ft` extension) are placed in the plugin's `fileTemplates/internal` resource directory.
3. A `CreateFileFromTemplateAction` subclass provides the user-facing action that displays a dialog and creates the file.
4. When the user triggers the action, `FileTemplateManager` retrieves the internal template by name, and `FileTemplateUtil.createFromTemplate` generates the `PsiFile` from the Velocity template.
5. The created file is opened in the editor automatically if `openFile` is `true`.
