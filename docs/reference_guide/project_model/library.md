---
title: Library
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

A library is an archive of compiled code (such as JAR files) that modules depend on.

The Consulo supports three types of libraries:
* **Module Library**: the library classes are visible only in this module.
* **Project Library**: the library classes are visible within the project and the library information is recorded under the `.idea/libraries` directory.
* **Global Library**: the library information is recorded in the global configuration directory. Global libraries are similar to project libraries, but are visible for different projects.

A particular type of programmatically defined libraries is [Predefined Libraries](#predefined-libraries).


## Accessing Libraries and Jars
The `libraries` package provides functionality for working with project libraries and jars.

### Getting a List of Libraries a Module Depends On
To get the list of libraries that a module depends on, use [`OrderEnumerator.forEachLibrary`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/layer/OrderEnumerator.java) as follows.

```java
final List<String> libraryNames = new ArrayList<String>();
ModuleRootManager.getInstance(module).orderEntries().forEachLibrary(library -> {
  libraryNames.add(library.getName());
  return true;
});
Messages.showInfoMessage(StringUtil.join(libraryNames, "\n"), "Libraries in Module");
```

This sample code outputs a list of libraries that the given module depends on.

### Getting a List of All Libraries
To manage the lists of application and project libraries, use [`LibraryTable`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/LibraryTable.java).
The list of application-level library tables is accessed by calling [`LibraryTablesRegistrar.getInstance().getLibraryTable()`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/LibraryTablesRegistrar.java), whereas the list of project-level library tables is accessed through [`LibraryTablesRegistrar.getInstance().getLibraryTable()`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/LibraryTablesRegistrar.java).
Once you have a [`LibraryTable`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/LibraryTable.java), you can get the libraries in it by calling [`LibraryTable.getLibraries()`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/LibraryTable.java).

To get the list of all module libraries defined in a given module, use the following API:

```java
OrderEntryUtil.getModuleLibraries(ModuleRootManager.getInstance(module));
```

### Getting the Library Content
[`Library`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/Library.java) provides the [`Library.getUrls()`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/Library.java) method you can use to get a list of source roots and classes the library includes.
To clarify, consider the following code snippet:

```java
StringBuilder roots = new StringBuilder("The " + lib.getName() + " library includes:\n");
roots.append("Sources:\n");
for (String each : lib.getUrls(OrderRootType.SOURCES)) {
  roots.append(each).append("\n");
}
roots.append("Classes:\n");
for (String each : lib.getUrls(OrderRootType.CLASSES)) {
  strRoots.append(each).append("\n");
}
Messages.showInfoMessage(roots.toString(), "Library Info");
```

### Creating a Library
To create a library, perform the following steps:
  * Get a [write action](../../basics/architectural_overview/general_threading_rules.md#readwrite-lock)
  * Obtain the library table to which you want to add the library. Use one of the following, depending on the library level:
      * [`LibraryTablesRegistrar.getInstance().getLibraryTable()`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/LibraryTablesRegistrar.java)
      * [`LibraryTablesRegistrar.getInstance().getLibraryTable(Project)`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/LibraryTablesRegistrar.java)
      * [`ModuleRootManager.getInstance(module).getModifiableModel().getModuleLibraryTable()`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/ModuleRootManager.java)
  * Create the library by calling [`LibraryTable.createLibrary()`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/LibraryTable.java)
  * Add contents to the library (see below)
  * For a module-level library, commit the modifiable model returned by [`ModuleRootManager.getInstance(module).getModifiableModel()`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/ModuleRootManager.java).

For module-level libraries, you can also use simplified APIs in the [`ModuleRootModificationUtil`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/util/ModuleRootModificationUtil.java) class to add a library with a single API call.

### Adding Contents or Modifying a Library
To add or change the roots of a library, you need to perform the following steps:
  * Get a [write action](../../basics/architectural_overview/general_threading_rules.md#readwrite-lock)
  * Get a **modifiable model** for the library, using [`Library.getModifiableModel()`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/Library.java)
  * Use methods such as [`Library.ModifiableModel.addRoot()`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/Library.java) to perform the necessary changes
  * Commit the model using [`Library.ModifiableModel.commit()`](https://github.com/consulo/consulo/blob/master/modules/base/application-content-api/src/main/java/consulo/content/library/Library.java).

### Adding a Library Dependency to a Module
Use [`ModuleRootModificationUtil.addDependency(module, library)`](https://github.com/consulo/consulo/blob/master/modules/base/module-content-api/src/main/java/consulo/module/content/util/ModuleRootModificationUtil.java) from under a write action.

### Checking Belonging to a Library
The `ProjectFileIndex` interface implements a number of methods you can use to check whether the specified file belongs to the project library classes or library sources.
You can use the following methods:

* To check if a specified virtual file is a compiled class file use
  ```java
    ProjectFileIndex.isLibraryClassFile(virtualFile)
  ```
* To check if a specified virtual file or directory belongs to library classes use
  ```java
    ProjectFileIndex.isInLibraryClasses(virtualFileorDirectory)
  ```
* To check if the specified virtual file or directory belongs to library sources use
  ```java
    ProjectFileIndex.isInLibrarySource(virtualFileorDirectory)
  ```

## Predefined Libraries
EP: `consulo.additionalLibraryRootsProvider`

`AdditionalLibraryRootsProvider`
Allows providing synthetic/predefined libraries (`SyntheticLibrary`) in a project without exposing them in the model.
By default, they're also hidden from UI.
